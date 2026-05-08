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

export async function saveTrainingPlan(
  clerkId: string,
  planData: unknown,
  isPremium: boolean = false
) {
  // Get user ID from clerk ID
  const { data: user, error: userLookupError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (userLookupError || !user) {
    throw new Error('User not found');
  }

  const { data, error } = await supabase
    .from('training_plans')
    .insert({
      user_id: user.id,
      plan_data: planData,
      is_premium: isPremium,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving training plan:', error);
    throw error;
  }

  return data;
}
