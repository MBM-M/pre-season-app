import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Clerk's React SDK attaches itself to `window.Clerk` after init. We use it
// here (outside of React) to read the current session token per request,
// because the Supabase client is a module-level singleton created before
// Clerk has finished bootstrapping.
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: (opts?: { template?: string }) => Promise<string | null>;
      };
    };
  }
}

/**
 * Supabase client wired for the Clerk third-party auth integration.
 *
 * `accessToken` is invoked per request: it returns the current Clerk session
 * token, which Supabase verifies via JWKS (configured in the dashboard under
 * Authentication → Third-Party Auth). RLS policies then read the Clerk user id
 * from `auth.jwt() ->> 'sub'` and filter rows accordingly.
 *
 * When the user is signed out, getToken() returns null, the Authorization
 * header is omitted, and only the anon key is in play — meaning RLS denies
 * access to every protected row, which is exactly what we want.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => {
    try {
      const token = await window.Clerk?.session?.getToken();
      return token ?? null;
    } catch (err) {
      console.warn('Could not get Clerk session token for Supabase:', err);
      return null;
    }
  },
});
