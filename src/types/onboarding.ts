export type Sport = 'football' | 'basketball' | 'hockey';

export type FootballPosition = 'goalkeeper' | 'defender' | 'midfielder' | 'forward';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type WeeksAvailable = 4 | 6 | 8 | 10;

export type DaysPerWeek = 2 | 3 | 4 | 5;

export type Equipment = 'field' | 'gym' | 'ball' | 'bands';

export type InjuryArea = 'none' | 'knee' | 'ankle' | 'back' | 'other';

export type PrimaryGoal = 'endurance' | 'strength' | 'speed' | 'skills' | 'weight-loss';

export type Region = 'uk-ireland' | 'canada-usa' | 'other';

export interface OnboardingData {
  region: Region;
  sport?: Sport;
  position?: FootballPosition;
  fitnessLevel: FitnessLevel;
  weeksAvailable: WeeksAvailable;
  daysPerWeek: DaysPerWeek;
  equipment: Equipment[];
  injury: InjuryArea;
  injuryDetails?: string;
  goal: PrimaryGoal;
  seasonStartDate?: string;
  // ISO timestamp of when the user gave explicit consent to process their
  // health-related (fitness + injury) data. Set at onboarding completion.
  healthConsentAt?: string;
}

export const SPORTS: { value: Sport; label: string; emoji: string; available: boolean }[] = [
  { value: 'football', label: 'Football', emoji: '⚽', available: true },
  { value: 'basketball', label: 'Basketball', emoji: '🏀', available: false },
  { value: 'hockey', label: 'Hockey', emoji: '🏒', available: false },
];

export const FOOTBALL_POSITIONS: { value: FootballPosition; label: string }[] = [
  { value: 'goalkeeper', label: 'Goalkeeper' },
  { value: 'defender', label: 'Defender' },
  { value: 'midfielder', label: 'Midfielder' },
  { value: 'forward', label: 'Forward' },
];

export const FITNESS_LEVELS: { value: FitnessLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Just getting back into it' },
  { value: 'intermediate', label: 'Intermediate', description: 'I train occasionally' },
  { value: 'advanced', label: 'Advanced', description: 'I train consistently' },
];

export const WEEKS_OPTIONS: { value: WeeksAvailable; label: string; months: string }[] = [
  { value: 4, label: '4 weeks', months: '1 month' },
  { value: 6, label: '6 weeks', months: '1½ months' },
  { value: 8, label: '8 weeks', months: '2 months' },
  { value: 10, label: '10+ weeks', months: '2½+ months' },
];

export const DAYS_OPTIONS: { value: DaysPerWeek; label: string }[] = [
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string; emoji: string }[] = [
  { value: 'field', label: 'Open field / park', emoji: '🏟️' },
  { value: 'gym', label: 'Gym membership', emoji: '🏋️' },
  { value: 'ball', label: 'Ball', emoji: '⚽' },
  { value: 'bands', label: 'Resistance bands', emoji: '💪' },
];

export const INJURY_OPTIONS: { value: InjuryArea; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'knee', label: 'Knee' },
  { value: 'ankle', label: 'Ankle' },
  { value: 'back', label: 'Back' },
  { value: 'other', label: 'Other' },
];

export const GOAL_OPTIONS: { value: PrimaryGoal; label: string; emoji: string }[] = [
  { value: 'endurance', label: 'Build endurance', emoji: '🏃' },
  { value: 'strength', label: 'Gain strength', emoji: '💪' },
  { value: 'speed', label: 'Improve speed', emoji: '⚡' },
  { value: 'skills', label: 'Sharpen skills', emoji: '⚽' },
  { value: 'weight-loss', label: 'Lose weight', emoji: '📉' },
];

export const REGIONS: { value: Region; label: string; flag: string }[] = [
  { value: 'uk-ireland', label: 'UK / Ireland', flag: '🇬🇧' },
  { value: 'canada-usa', label: 'Canada / USA', flag: '🇨🇦' },
  { value: 'other', label: 'Other', flag: '🌍' },
];
