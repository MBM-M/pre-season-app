import { OnboardingData } from '@/types/onboarding';
import { TrainingPlan } from '@/lib/planGenerator';

interface InvokeResponse {
  plan?: TrainingPlan;
  error?: string;
}

/**
 * Calls the `generate-premium-plan` Supabase Edge Function, which in turn
 * calls the Anthropic API server-side. The API key never touches the browser.
 *
 * We bypass `supabase.functions.invoke()` and use raw fetch here so we can
 * authenticate with the anon key directly. The supabase-js client is now
 * configured to send Clerk JWTs (for RLS), but Edge Functions verify tokens
 * against Supabase Auth's signing keys — not Clerk's — so a Clerk JWT comes
 * back 401. The anon key is always accepted and the function does its own
 * input validation, so this is safe.
 */
export async function generateAITrainingPlan(
  data: OnboardingData,
  generationToken: string
): Promise<TrainingPlan> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-premium-plan`;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({ onboardingData: data, generationToken }),
    });
  } catch (err) {
    throw new Error(
      err instanceof Error ? `Network error: ${err.message}` : 'Network error'
    );
  }

  if (res.status === 404) {
    throw new Error(
      "Premium plan generator isn't deployed yet. Deploy generate-premium-plan in the Supabase dashboard."
    );
  }

  if (!res.ok) {
    let body = '';
    try {
      body = await res.text();
    } catch {
      // ignore
    }
    throw new Error(
      `Premium plan function failed (${res.status})${body ? ': ' + body.slice(0, 200) : ''}`
    );
  }

  let result: InvokeResponse;
  try {
    result = await res.json();
  } catch {
    throw new Error('Premium plan function returned non-JSON response');
  }

  if (!result.plan) {
    throw new Error(result.error ?? 'No plan returned from the premium generator');
  }

  return result.plan;
}
