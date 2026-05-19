import { TrainingPlan } from '@/lib/planGenerator';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface PlanProgress {
  /** Calendar days elapsed since the plan started (clamped to >= 0). */
  daysSinceStart: number;
  /** Total weeks the plan spans. */
  totalWeeks: number;
  /** Current week of the plan, clamped to [1, totalWeeks]. */
  currentWeek: number;
  /** True when the user has passed the end of the plan window. */
  isComplete: boolean;
  /** The next session the user hasn't ticked off, or null if all done. */
  nextSession: { weekNumber: number; day: number; title: string; focus: string } | null;
}

/**
 * Derive "where the user is" in their plan from the plan's `started_at`
 * timestamp and the set of session keys they've marked complete.
 *
 * Keys in `completedSessions` are formatted `${weekNumber}-${day}` to match
 * what TrainingPlanDisplay and Dashboard already use.
 */
export function getPlanProgress(
  startedAt: string,
  plan: TrainingPlan,
  completedSessions: Set<string>
): PlanProgress {
  const startMs = Date.parse(startedAt);
  const daysSinceStart = Math.max(
    0,
    Math.floor((Date.now() - startMs) / MS_PER_DAY)
  );
  const totalWeeks = plan.weeks.length;
  const computedWeek = Math.floor(daysSinceStart / 7) + 1;
  const isComplete = computedWeek > totalWeeks;
  const currentWeek = Math.min(Math.max(1, computedWeek), totalWeeks);

  // Next session: starting from the current plan week, find the first session
  // the user hasn't completed yet. Mirrors what a coach would suggest next.
  let nextSession: PlanProgress['nextSession'] = null;
  for (let w = currentWeek - 1; w < plan.weeks.length; w++) {
    const week = plan.weeks[w];
    for (const session of week.sessions) {
      const key = `${week.weekNumber}-${session.day}`;
      if (!completedSessions.has(key)) {
        nextSession = {
          weekNumber: week.weekNumber,
          day: session.day,
          title: session.title,
          focus: session.focus,
        };
        break;
      }
    }
    if (nextSession) break;
  }

  return { daysSinceStart, totalWeeks, currentWeek, isComplete, nextSession };
}
