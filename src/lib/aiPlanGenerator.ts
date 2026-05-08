import { OnboardingData } from '@/types/onboarding';
import { TrainingPlan } from '@/lib/planGenerator';
import { supabase } from '@/lib/supabase';

interface InvokeResponse {
  plan?: TrainingPlan;
  error?: string;
}

/**
 * Calls the `generate-premium-plan` Supabase Edge Function, which in turn
 * calls the Anthropic API server-side. The API key never touches the browser.
 *
 * If the function isn't deployed yet, the supabase client returns a 404 and
 * we surface a clear setup message so the dev knows what to do.
 */
export async function generateAITrainingPlan(
  data: OnboardingData
): Promise<TrainingPlan> {
  const { data: result, error } = await supabase.functions.invoke<InvokeResponse>(
    'generate-premium-plan',
    { body: { onboardingData: data } }
  );

  if (error) {
    // FunctionsHttpError exposes a `context.response` with the body — try to
    // surface the function's own error message rather than a generic one.
    const ctx = (error as unknown as { context?: { status?: number } }).context;
    if (ctx?.status === 404) {
      throw new Error(
        "Premium plan generator isn't deployed yet. Run `supabase functions deploy generate-premium-plan` from the project root."
      );
    }
    throw new Error(error.message || 'Failed to reach the premium plan function');
  }

  if (!result?.plan) {
    throw new Error(result?.error ?? 'No plan returned from the premium generator');
  }

  return result.plan;
}
