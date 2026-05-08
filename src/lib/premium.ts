/**
 * Premium tier helper.
 *
 * For now, premium status is gated on a localStorage flag the user can flip
 * in Settings → Developer. When Stripe is wired up later, this is the single
 * place to swap the source of truth (e.g. a `subscription_tier` field on the
 * users row) without touching every UI consumer.
 */

const PREMIUM_KEY = 'dev_premium_enabled';

export function isPremium(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(PREMIUM_KEY) === 'true';
}

export function setPremium(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  if (enabled) {
    window.localStorage.setItem(PREMIUM_KEY, 'true');
  } else {
    window.localStorage.removeItem(PREMIUM_KEY);
  }
}
