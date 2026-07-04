import { TrainingPlan } from '@/lib/planGenerator';
import { SessionCompletion } from '@/lib/database';

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

export interface StreakInfo {
  /**
   * Consecutive plan-weeks with at least one logged session, counting back
   * from the current week. The in-progress current week extends the streak
   * when it has a completion but never breaks it (the week isn't over yet).
   */
  weekStreak: number;
  /** Sessions logged in the current plan week. */
  sessionsThisWeek: number;
  /** Sessions scheduled in the current plan week. */
  plannedThisWeek: number;
  /** Weeks (before the current one) where every scheduled session was logged. */
  perfectWeeks: number;
}

/**
 * Derive streak stats from completion rows. Streaks are measured in plan-weeks
 * rather than calendar days — plans schedule 2–5 sessions a week, so a daily
 * streak would break on every planned rest day.
 */
export function getStreakInfo(
  completions: SessionCompletion[],
  plan: TrainingPlan,
  currentWeek: number
): StreakInfo {
  const byWeek = new Map<number, number>();
  for (const c of completions) {
    byWeek.set(c.weekNumber, (byWeek.get(c.weekNumber) ?? 0) + 1);
  }

  const sessionsThisWeek = byWeek.get(currentWeek) ?? 0;
  const plannedThisWeek =
    plan.weeks.find((w) => w.weekNumber === currentWeek)?.sessions.length ?? 0;

  let weekStreak = sessionsThisWeek > 0 ? 1 : 0;
  for (let w = currentWeek - 1; w >= 1; w--) {
    if ((byWeek.get(w) ?? 0) > 0) weekStreak += 1;
    else break;
  }

  let perfectWeeks = 0;
  for (const week of plan.weeks) {
    if (week.weekNumber >= currentWeek) continue;
    if ((byWeek.get(week.weekNumber) ?? 0) >= week.sessions.length && week.sessions.length > 0) {
      perfectWeeks += 1;
    }
  }

  return { weekStreak, sessionsThisWeek, plannedThisWeek, perfectWeeks };
}
