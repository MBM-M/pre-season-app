import { supabase } from './supabase';
import {
  OnboardingData,
  Region,
  FootballPosition,
  FitnessLevel,
  WeeksAvailable,
  DaysPerWeek,
  Equipment,
  InjuryArea,
  PrimaryGoal,
  Sport,
} from '@/types/onboarding';

interface UserPreferencesRow {
  region: Region;
  sport: Sport | null;
  position: FootballPosition | null;
  fitness_level: FitnessLevel;
  weeks_available: WeeksAvailable;
  days_per_week: DaysPerWeek;
  equipment: Equipment[] | null;
  injury: InjuryArea;
  injury_details: string | null;
  goal: PrimaryGoal;
  season_start_date: string | null;
}

function rowToOnboardingData(row: UserPreferencesRow): OnboardingData {
  return {
    region: row.region,
    sport: row.sport ?? 'football',
    position: row.position ?? undefined,
    fitnessLevel: row.fitness_level,
    weeksAvailable: row.weeks_available,
    daysPerWeek: row.days_per_week,
    equipment: row.equipment ?? [],
    injury: row.injury,
    injuryDetails: row.injury_details ?? undefined,
    goal: row.goal,
    seasonStartDate: row.season_start_date ?? undefined,
  };
}

/** Look up the Supabase users.id (UUID) for a given Clerk user id (string).
 *  All other helpers consume this — pulled out so we have one definition. */
async function getUserIdByClerk(clerkId: string): Promise<string> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .maybeSingle();
  if (error) {
    console.error('Error looking up user by clerk_id:', error);
    throw error;
  }
  if (!data) throw new Error('User not found');
  return data.id as string;
}

export async function saveUserPreferences(
  clerkId: string,
  email: string,
  preferences: OnboardingData
) {
  // First, ensure user exists
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert(
      { clerk_id: clerkId, email: email },
      { onConflict: 'clerk_id' }
    )
    .select()
    .single();

  if (userError) {
    console.error('Error creating user:', userError);
    throw userError;
  }

  // Then save preferences
  const { data: savedPreferences, error: preferencesError } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: user.id,
        region: preferences.region,
        sport: preferences.sport || 'football',
        position: preferences.position,
        fitness_level: preferences.fitnessLevel,
        weeks_available: preferences.weeksAvailable,
        days_per_week: preferences.daysPerWeek,
        equipment: preferences.equipment,
        injury: preferences.injury,
        injury_details: preferences.injuryDetails,
        goal: preferences.goal,
        season_start_date: preferences.seasonStartDate || null,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (preferencesError) {
    console.error('Error saving preferences:', preferencesError);
    throw preferencesError;
  }

  return savedPreferences;
}

export async function getUserPreferences(clerkId: string): Promise<OnboardingData | null> {
  // Fetch the user_preferences row whose joined user has this clerk_id.
  // Inner-joining via !inner ensures the .eq filter on the joined table
  // actually constrains the result rather than just shaping the response.
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*, users!inner(clerk_id)')
    .eq('users.clerk_id', clerkId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching preferences:', error);
    throw error;
  }

  if (!data) return null;

  return rowToOnboardingData(data as UserPreferencesRow);
}

// ─────────────────────────────────────────────────────────────────────────────
// Training plans
// ─────────────────────────────────────────────────────────────────────────────

export interface SavedPlan {
  id: string;
  planData: unknown;
  isPremium: boolean;
  createdAt: string;
  /** When the user activated this plan; drives "today's workout" derivation. */
  startedAt: string;
}

interface TrainingPlanRow {
  id: string;
  plan_data: unknown;
  is_premium: boolean;
  created_at: string;
  started_at: string;
}

function rowToSavedPlan(row: TrainingPlanRow): SavedPlan {
  return {
    id: row.id,
    planData: row.plan_data,
    isPremium: row.is_premium,
    createdAt: row.created_at,
    startedAt: row.started_at,
  };
}

export async function saveTrainingPlan(
  clerkId: string,
  planData: unknown,
  isPremium: boolean = false
): Promise<SavedPlan> {
  const userId = await getUserIdByClerk(clerkId);

  const { data, error } = await supabase
    .from('training_plans')
    .insert({
      user_id: userId,
      plan_data: planData,
      is_premium: isPremium,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving training plan:', error);
    throw error;
  }

  return rowToSavedPlan(data as TrainingPlanRow);
}

/** Return the user's most recent saved plan, or null if they have none. */
export async function getLatestPlan(clerkId: string): Promise<SavedPlan | null> {
  let userId: string;
  try {
    userId = await getUserIdByClerk(clerkId);
  } catch {
    // No user row yet (e.g. brand-new account before onboarding save)
    return null;
  }

  const { data, error } = await supabase
    .from('training_plans')
    .select('id, plan_data, is_premium, created_at, started_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching latest plan:', error);
    throw error;
  }

  return data ? rowToSavedPlan(data as TrainingPlanRow) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Workout completions
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionCompletion {
  weekNumber: number;
  day: number;
  completedAt: string;
}

interface CompletionRow {
  week_number: number;
  day: number;
  completed_at: string;
}

export async function markSessionComplete(
  clerkId: string,
  planId: string,
  weekNumber: number,
  day: number
): Promise<void> {
  const userId = await getUserIdByClerk(clerkId);

  const { error } = await supabase.from('workout_completions').upsert(
    {
      user_id: userId,
      plan_id: planId,
      week_number: weekNumber,
      day,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,plan_id,week_number,day' }
  );

  if (error) {
    console.error('Error marking session complete:', error);
    throw error;
  }
}

export async function unmarkSessionComplete(
  clerkId: string,
  planId: string,
  weekNumber: number,
  day: number
): Promise<void> {
  const userId = await getUserIdByClerk(clerkId);

  const { error } = await supabase
    .from('workout_completions')
    .delete()
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .eq('week_number', weekNumber)
    .eq('day', day);

  if (error) {
    console.error('Error unmarking session:', error);
    throw error;
  }
}

export async function getCompletions(planId: string): Promise<SessionCompletion[]> {
  const { data, error } = await supabase
    .from('workout_completions')
    .select('week_number, day, completed_at')
    .eq('plan_id', planId);

  if (error) {
    console.error('Error fetching completions:', error);
    throw error;
  }

  return (data ?? []).map((row) => {
    const r = row as CompletionRow;
    return {
      weekNumber: r.week_number,
      day: r.day,
      completedAt: r.completed_at,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Account: export + delete (GDPR / App Store Connect requirements)
// ─────────────────────────────────────────────────────────────────────────────

export interface UserDataExport {
  exportedAt: string;
  account: { clerkId: string; email: string; createdAt: string };
  preferences: OnboardingData | null;
  plans: SavedPlan[];
  completions: Array<{
    planId: string;
    weekNumber: number;
    day: number;
    completedAt: string;
  }>;
}

/** Collect every row tied to the user into a single JSON payload. */
export async function exportUserData(clerkId: string): Promise<UserDataExport> {
  const userId = await getUserIdByClerk(clerkId);

  const { data: userRow, error: userErr } = await supabase
    .from('users')
    .select('clerk_id, email, created_at')
    .eq('id', userId)
    .single();
  if (userErr) {
    console.error('Error fetching user row for export:', userErr);
    throw userErr;
  }

  const preferences = await getUserPreferences(clerkId);

  const { data: planRows, error: planErr } = await supabase
    .from('training_plans')
    .select('id, plan_data, is_premium, created_at, started_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (planErr) {
    console.error('Error fetching plans for export:', planErr);
    throw planErr;
  }

  const { data: completionRows, error: compErr } = await supabase
    .from('workout_completions')
    .select('plan_id, week_number, day, completed_at')
    .eq('user_id', userId);
  if (compErr) {
    console.error('Error fetching completions for export:', compErr);
    throw compErr;
  }

  return {
    exportedAt: new Date().toISOString(),
    account: {
      clerkId: (userRow as { clerk_id: string }).clerk_id,
      email: (userRow as { email: string }).email,
      createdAt: (userRow as { created_at: string }).created_at,
    },
    preferences,
    plans: (planRows ?? []).map((r) => rowToSavedPlan(r as TrainingPlanRow)),
    completions: (completionRows ?? []).map((r) => {
      const row = r as {
        plan_id: string;
        week_number: number;
        day: number;
        completed_at: string;
      };
      return {
        planId: row.plan_id,
        weekNumber: row.week_number,
        day: row.day,
        completedAt: row.completed_at,
      };
    }),
  };
}

/** Delete every row tied to the user. Cascades via ON DELETE CASCADE on the FK
 *  from each child table back to users(id). Does NOT delete the Clerk auth
 *  account — that lives in Clerk and the caller deletes it separately. */
export async function deleteAccountData(clerkId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('clerk_id', clerkId);

  if (error) {
    console.error('Error deleting account data:', error);
    throw error;
  }
}
