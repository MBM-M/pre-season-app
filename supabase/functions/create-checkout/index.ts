// Supabase Edge Function: create-checkout
//
// Creates a Stripe Checkout Session for a one-off AI-plan purchase, priced in
// the visitor's local currency, and records a `pending` purchases row. The
// stripe-webhook function flips that row to `paid` once Stripe confirms the
// payment, which is what actually grants the credit.
//
// Premium is a one-off "season pass" priced by season length, so there are 12
// Stripe prices (3 currencies × 4 lengths). The season length is read from the
// user's saved preferences server-side, so it can't be spoofed from the client.
//
// Secrets required (set with `supabase secrets set ...`):
//   STRIPE_SECRET_KEY        sk_test_... / sk_live_...
//   STRIPE_PRICE_GBP_4 / _6 / _8 / _10     four £ price ids
//   STRIPE_PRICE_CAD_4 / _6 / _8 / _10     four $ CAD price ids
//   STRIPE_PRICE_USD_4 / _6 / _8 / _10     four $ USD price ids
//   APP_URL                  https://your-app.vercel.app  (no trailing slash)
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
// Deploy:  supabase functions deploy create-checkout

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

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const APP_URL = (Deno.env.get('APP_URL') ?? '').replace(/\/$/, '');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

function currencyForRegion(region: string): 'GBP' | 'CAD' | 'USD' {
  if (region === 'uk-ireland') return 'GBP';
  if (region === 'canada-usa') return 'CAD';
  return 'USD';
}

// Pick the Stripe price for this currency + season length, e.g. STRIPE_PRICE_CAD_8.
function priceFor(region: string, weeks: number): { price?: string; currency: string } {
  const cur = currencyForRegion(region);
  const w = [4, 6, 8, 10].includes(weeks) ? weeks : 8;
  return { price: Deno.env.get(`STRIPE_PRICE_${cur}_${w}`), currency: cur.toLowerCase() };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  if (!STRIPE_SECRET_KEY) return json({ error: 'STRIPE_SECRET_KEY not set' }, 500);
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json({ error: 'Supabase service credentials not available' }, 500);
  }
  if (!APP_URL) return json({ error: 'APP_URL not set' }, 500);

  let payload: { clerkId?: string; email?: string; region?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const clerkId = payload?.clerkId;
  const region = payload?.region ?? 'other';
  const email = payload?.email ?? undefined;
  if (!clerkId) return json({ error: 'Missing clerkId' }, 400);

  // Deno edge runtime: Stripe must use the fetch-based HTTP client.
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Resolve (or create) the Supabase user row for this Clerk id.
  const { data: user, error: userErr } = await admin
    .from('users')
    .upsert({ clerk_id: clerkId, email: email ?? '' }, { onConflict: 'clerk_id' })
    .select('id')
    .single();

  if (userErr || !user) {
    console.error('create-checkout: user upsert failed', userErr);
    return json({ error: 'Could not resolve user' }, 500);
  }

  // Season length comes from the user's saved preferences — never the client.
  const { data: prefs } = await admin
    .from('user_preferences')
    .select('weeks_available')
    .eq('user_id', user.id)
    .maybeSingle();
  const weeks = Number(prefs?.weeks_available ?? 8);

  const { price, currency } = priceFor(region, weeks);
  if (!price) {
    return json(
      { error: `No Stripe price configured for ${currency.toUpperCase()} / ${weeks} weeks` },
      500
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price, quantity: 1 }],
      success_url: `${APP_URL}/?checkout=success`,
      cancel_url: `${APP_URL}/?checkout=cancel`,
      client_reference_id: clerkId,
      metadata: { user_id: user.id, region, weeks: String(weeks) },
      ...(email ? { customer_email: email } : {}),
    });

    // Record the pending purchase so the webhook can flip it to paid.
    const { error: insertErr } = await admin.from('purchases').insert({
      user_id: user.id,
      stripe_session_id: session.id,
      currency,
      amount: session.amount_total ?? 0,
      weeks,
      status: 'pending',
    });
    if (insertErr) {
      console.error('create-checkout: pending purchase insert failed', insertErr);
      return json({ error: 'Could not record purchase' }, 500);
    }

    return json({ url: session.url });
  } catch (e) {
    console.error('create-checkout: stripe error', e);
    return json({ error: (e as Error).message ?? 'Stripe error' }, 500);
  }
});
