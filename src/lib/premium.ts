/**
 * Premium tier — one-off "season pass".
 *
 * A completed Stripe Checkout creates a paid `purchases` row whose `expires_at`
 * is the season length from purchase. While that pass is active the user can
 * generate AI plans without limit. The source of truth lives in the database;
 * these helpers read it and kick off checkout.
 *
 *   getActivePassExpiry()  → ISO expiry of the active pass, or null if none
 *   claimGeneration()      → token the generate function requires (issued only
 *                            while a pass is active)
 *   startCheckout()        → redirect to Stripe to buy a season pass
 */

import { supabase } from './supabase';
import { Region } from '@/types/onboarding';

/** ISO timestamp the active pass expires, or null when there's no active pass. */
export async function getActivePassExpiry(): Promise<string | null> {
  const { data, error } = await supabase.rpc('active_ai_pass_expiry');
  if (error) {
    console.error('Error reading AI season pass:', error);
    return null;
  }
  return typeof data === 'string' ? data : null;
}

/**
 * Get a one-time generation token. Throws 'no_active_pass' (surfaced from the
 * Postgres function) when the user has no active season pass.
 */
export async function claimGeneration(): Promise<string> {
  const { data, error } = await supabase.rpc('claim_ai_generation');
  if (error) {
    // The RPC raises 'no_active_pass' / 'not_authenticated'; bubble it up.
    throw new Error(error.message || 'Could not authorize AI generation');
  }
  if (typeof data !== 'string') {
    throw new Error('Unexpected response while authorizing generation');
  }
  return data;
}

/**
 * Create a Stripe Checkout Session for a season pass and redirect the browser
 * to it. The season length (and therefore price) is read server-side from the
 * user's saved preferences; the currency follows the region.
 */
export async function startCheckout(
  clerkId: string,
  email: string,
  region: Region
): Promise<void> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify({ clerkId, email, region }),
  });

  if (!res.ok) {
    let body = '';
    try {
      body = await res.text();
    } catch {
      // ignore
    }
    throw new Error(
      `Could not start checkout (${res.status})${body ? ': ' + body.slice(0, 200) : ''}`
    );
  }

  const { url: checkoutUrl } = (await res.json()) as { url?: string };
  if (!checkoutUrl) throw new Error('Checkout session did not return a URL');

  window.location.href = checkoutUrl;
}
