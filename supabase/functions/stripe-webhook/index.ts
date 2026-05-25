// Supabase Edge Function: stripe-webhook
//
// Receives Stripe events and, on a completed Checkout, flips the matching
// purchases row to `paid` (which is what grants the AI-plan credit). This is
// the ONLY path that creates a paid credit — the frontend can't fake it.
//
// IMPORTANT: deploy with JWT verification OFF, because Stripe calls this with
// no Supabase auth header:
//   supabase functions deploy stripe-webhook --no-verify-jwt
//
// Secrets required:
//   STRIPE_SECRET_KEY        sk_test_... / sk_live_...
//   STRIPE_WEBHOOK_SECRET    whsec_...   (from the webhook endpoint you create)
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.

// @ts-ignore — Deno-only import resolved by the edge runtime
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
// @ts-ignore — npm specifier resolved by the edge runtime
import Stripe from 'npm:stripe@^14';
// @ts-ignore — npm specifier resolved by the edge runtime
import { createClient } from 'npm:@supabase/supabase-js@2';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  if (!STRIPE_SECRET_KEY || !WEBHOOK_SECRET || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response('Server not configured', { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('Missing stripe-signature header', { status: 400 });

  const rawBody = await req.text();
  // Deno edge runtime: fetch HTTP client + SubtleCrypto provider are required.
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      WEBHOOK_SECRET,
      undefined,
      cryptoProvider
    );
  } catch (e) {
    console.error('stripe-webhook: signature verification failed', e);
    return new Response(`Signature verification failed: ${(e as Error).message}`, {
      status: 400,
    });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // For one-off card payments, a completed session is paid. Guard anyway.
    if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

      // The pass runs for the purchased season length from now.
      // Prefer the weeks stored on the pending purchase; fall back to metadata.
      const { data: row } = await admin
        .from('purchases')
        .select('weeks')
        .eq('stripe_session_id', session.id)
        .maybeSingle();
      const weeks = Number(row?.weeks ?? session.metadata?.weeks ?? 8);
      const expiresAt = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await admin
        .from('purchases')
        .update({
          status: 'paid',
          expires_at: expiresAt,
          stripe_payment_intent:
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
          amount: session.amount_total ?? 0,
        })
        .eq('stripe_session_id', session.id);

      if (error) {
        console.error('stripe-webhook: failed to mark purchase paid', error);
        // 500 so Stripe retries the delivery.
        return new Response('Database update failed', { status: 500 });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
