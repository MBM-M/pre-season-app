import { OnboardingData, PrimaryGoal, FitnessLevel } from '@/types/onboarding';

export type Metric = 'endurance' | 'strength' | 'speed' | 'technique';

export interface MetricProjection {
  metric: Metric;
  label: string;
  emoji: string;
  /** Projected % gain over baseline by end of plan. */
  gain: number;
  /** True if this is the metric the user's primary goal targets directly. */
  primary: boolean;
}

export interface ImprovementProjection {
  weeks: number;
  primaryMetric: Metric;
  metrics: MetricProjection[];
  /** Cumulative overall-fitness % gain at each week (length === weeks). */
  weeklyCurve: number[];
  /** Headline number — overall fitness gain by the end. */
  overallGain: number;
}

const METRIC_META: Record<Metric, { label: string; emoji: string }> = {
  endurance: { label: 'Endurance', emoji: '🫁' },
  strength: { label: 'Strength', emoji: '💪' },
  speed: { label: 'Speed', emoji: '⚡' },
  technique: { label: 'Technique', emoji: '🎯' },
};

// Goal → which metric is the headline gain
const GOAL_TO_PRIMARY: Record<PrimaryGoal, Metric> = {
  endurance: 'endurance',
  strength: 'strength',
  speed: 'speed',
  skills: 'technique',
  'weight-loss': 'endurance',
};

// Goal → emphasis multipliers per metric (relative weighting of training time)
const GOAL_EMPHASIS: Record<PrimaryGoal, Record<Metric, number>> = {
  endurance: { endurance: 1.55, strength: 0.85, speed: 1.1, technique: 0.9 },
  strength: { endurance: 0.9, strength: 1.55, speed: 1.05, technique: 0.85 },
  speed: { endurance: 1.0, strength: 1.1, speed: 1.55, technique: 0.9 },
  skills: { endurance: 0.95, strength: 0.85, speed: 1.0, technique: 1.6 },
  'weight-loss': { endurance: 1.5, strength: 1.0, speed: 1.0, technique: 0.85 },
};

// Beginners gain more in % terms (newbie gains); advanced athletes plateau harder
const FITNESS_FACTOR: Record<FitnessLevel, number> = {
  beginner: 1.25,
  intermediate: 1.0,
  advanced: 0.78,
};

/**
 * Saturating curve — diminishing returns over time.
 * 4w → ~17 baseline, 6w → ~24, 8w → ~30, 10w → ~35.
 */
function baseGainAtWeek(week: number): number {
  return 50 * (1 - Math.exp(-week / 7));
}

export function computeProjection(data: OnboardingData): ImprovementProjection {
  const weeks = data.weeksAvailable;
  const fitnessFactor = FITNESS_FACTOR[data.fitnessLevel];
  const goal = data.goal;
  const primary = GOAL_TO_PRIMARY[goal];
  const emphasis = GOAL_EMPHASIS[goal];

  // Equipment lifts the ceiling slightly — more variety of stimulus.
  const equipmentBoost = 1 + Math.min(0.15, 0.04 * data.equipment.length);

  // Frequency boost — more days/week gives more accumulated stimulus, with diminishing returns.
  const frequencyBoost = 0.85 + 0.07 * Math.min(data.daysPerWeek, 5);

  // Injury slightly tempers gains for the affected systems but doesn't kill them.
  const injuryDamper = data.injury === 'none' ? 1.0 : 0.92;

  const baseAtEnd = baseGainAtWeek(weeks);
  const commonFactor = fitnessFactor * equipmentBoost * frequencyBoost * injuryDamper;

  const metrics: MetricProjection[] = (Object.keys(METRIC_META) as Metric[]).map((m) => {
    const raw = baseAtEnd * commonFactor * emphasis[m];
    // Round to whole percent, clamp to a sensible max.
    const gain = Math.max(4, Math.min(65, Math.round(raw)));
    return {
      metric: m,
      label: METRIC_META[m].label,
      emoji: METRIC_META[m].emoji,
      gain,
      primary: m === primary,
    };
  });

  // Weekly cumulative overall-fitness curve — average across metrics, scaled to weeks.
  const overallEndFactor = commonFactor * (Object.values(emphasis).reduce((a, b) => a + b, 0) / 4);
  const weeklyCurve: number[] = [];
  for (let w = 1; w <= weeks; w++) {
    weeklyCurve.push(Math.round(baseGainAtWeek(w) * overallEndFactor));
  }

  const overallGain = weeklyCurve[weeklyCurve.length - 1];

  return {
    weeks,
    primaryMetric: primary,
    metrics,
    weeklyCurve,
    overallGain,
  };
}
