import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { OnboardingData } from '@/types/onboarding';
import { Button } from '@/components/ui/Button';
import {
  REGIONS,
  FITNESS_LEVELS,
  GOAL_OPTIONS,
  EQUIPMENT_OPTIONS,
  INJURY_OPTIONS,
  FOOTBALL_POSITIONS,
} from '@/types/onboarding';
import { TrainingPlan } from '@/lib/planGenerator';
import { getCompletions } from '@/lib/database';
import { getPlanProgress } from '@/lib/planSchedule';

interface DashboardProps {
  userData: OnboardingData;
  email: string;
  onGeneratePlan: () => void;
  onGenerateAIPlan: () => void;
  isGeneratingAI?: boolean;
  /** True when the user has an active AI season pass. */
  hasPass?: boolean;
  /** ISO expiry of the active pass, for the "access until" note. */
  passExpiry?: string | null;
  /** Display price for the user's season pass, e.g. "£8" / "$15". */
  premiumPrice?: string;
  /** Kick off Stripe Checkout to buy a season pass. */
  onBuyPremium?: () => void;
  isStartingCheckout?: boolean;
  planId?: string | null;
  plan?: TrainingPlan | null;
  planStartedAt?: string | null;
  onViewPlan?: () => void;
}

export const Dashboard = ({
  userData,
  email,
  onGeneratePlan,
  onGenerateAIPlan,
  isGeneratingAI = false,
  hasPass = false,
  passExpiry = null,
  premiumPrice,
  onBuyPremium,
  isStartingCheckout = false,
  planId = null,
  plan = null,
  planStartedAt = null,
  onViewPlan,
}: DashboardProps) => {
  const passExpiryLabel = passExpiry
    ? new Date(passExpiry).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;
  const goalInfo = GOAL_OPTIONS.find(g => g.value === userData.goal);
  const positionInfo = FOOTBALL_POSITIONS.find(p => p.value === userData.position);
  const regionInfo = REGIONS.find(r => r.value === userData.region);
  const fitnessInfo = FITNESS_LEVELS.find(f => f.value === userData.fitnessLevel);

  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    // No plan → widget doesn't render anyway; initial useState() is correct.
    if (!planId) return;
    let cancelled = false;
    getCompletions(planId)
      .then((rows) => {
        if (cancelled) return;
        setCompleted(new Set(rows.map((r) => `${r.weekNumber}-${r.day}`)));
      })
      .catch((err) => {
        console.error('Error loading completions for dashboard widget:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [planId]);

  const totalSessions = useMemo(
    () => (plan ? plan.weeks.reduce((s, w) => s + w.sessions.length, 0) : 0),
    [plan]
  );
  const completedCount = completed.size;
  const completionPct = totalSessions
    ? Math.round((completedCount / totalSessions) * 100)
    : 0;

  // Derive "where am I in the plan today?" — null when we don't have all the
  // inputs (e.g. plan exists but hasn't been hydrated yet).
  const progress = useMemo(() => {
    if (!plan || !planStartedAt) return null;
    return getPlanProgress(planStartedAt, plan, completed);
  }, [plan, planStartedAt, completed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-display text-4xl sm:text-5xl font-bold mb-4"
        >
          Welcome to Pre-Season
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400"
        >
          {email}
        </motion.p>
      </div>

      {/* "Your plan" widget — today's suggested workout + overall progress */}
      {plan && planId && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/30 p-6"
        >
          <div className="text-xs uppercase tracking-wide font-mono text-emerald-300 mb-3">
            Your plan
          </div>

          {/* Today's workout */}
          {progress?.isComplete ? (
            <div className="mb-5">
              <div className="text-2xl sm:text-3xl font-display font-bold mb-1">
                Plan complete
              </div>
              <div className="text-sm text-gray-400">
                You logged {completedCount} of {totalSessions} sessions. Time to onboard a new cycle when you're ready.
              </div>
            </div>
          ) : progress?.nextSession ? (
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
              <div className="min-w-0">
                <div className="text-xs font-mono uppercase tracking-wide text-gray-400 mb-1">
                  Week {progress.currentWeek} of {progress.totalWeeks} · next up
                </div>
                <div className="text-2xl sm:text-3xl font-display font-bold leading-tight">
                  {progress.nextSession.title}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  {progress.nextSession.focus} · Day {progress.nextSession.day}
                </div>
              </div>
              {onViewPlan && (
                <Button variant="primary" onClick={onViewPlan} className="shrink-0 self-start sm:self-auto">
                  Open it →
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
              <div>
                <div className="text-2xl sm:text-3xl font-display font-bold mb-1">
                  All sessions ticked off
                </div>
                <div className="text-sm text-gray-400">
                  You're ahead of schedule. Review the plan or wait for the next training day.
                </div>
              </div>
              {onViewPlan && (
                <Button variant="ghost" onClick={onViewPlan} className="shrink-0 self-start sm:self-auto">
                  Review plan →
                </Button>
              )}
            </div>
          )}

          {/* Progress bar */}
          <div className="border-t border-emerald-500/20 pt-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-mono text-2xl font-bold text-emerald-400">{completedCount}</span>
              <span className="text-sm text-gray-300">of {totalSessions} sessions</span>
              <span className="ml-auto font-mono text-xs text-gray-400">{completionPct}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Overview */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📅</span>
            <span className="text-gray-400 text-sm">Duration</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">{userData.weeksAvailable}</div>
          <div className="text-sm text-gray-400">weeks</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📆</span>
            <span className="text-gray-400 text-sm">Frequency</span>
          </div>
          <div className="text-3xl font-bold text-cyan-400">{userData.daysPerWeek}</div>
          <div className="text-sm text-gray-400">days per week</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{goalInfo?.emoji || '🎯'}</span>
            <span className="text-gray-400 text-sm">Goal</span>
          </div>
          <div className="text-xl font-bold text-purple-400 truncate">{goalInfo?.label}</div>
        </div>
      </motion.div>

      {/* Details Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {/* Position */}
        {positionInfo && (
          <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30">
            <div className="text-sm text-gray-400 mb-1">Position</div>
            <div className="text-lg font-semibold">{positionInfo.label}</div>
          </div>
        )}

        {/* Fitness Level */}
        <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30">
          <div className="text-sm text-gray-400 mb-1">Fitness Level</div>
          <div className="text-lg font-semibold">{fitnessInfo?.label}</div>
        </div>

        {/* Region */}
        <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30">
          <div className="text-sm text-gray-400 mb-1">Region</div>
          <div className="text-lg font-semibold">{regionInfo?.label}</div>
        </div>

        {/* Injury Status */}
        <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30">
          <div className="text-sm text-gray-400 mb-1">Injury Status</div>
          <div className="text-lg font-semibold">
            {INJURY_OPTIONS.find(i => i.value === userData.injury)?.label}
          </div>
          {userData.injuryDetails && (
            <div className="text-sm text-gray-400 mt-1">{userData.injuryDetails}</div>
          )}
        </div>
      </motion.div>

      {/* Equipment */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30 mb-8"
      >
        <div className="text-sm text-gray-400 mb-3">Available Equipment</div>
        <div className="flex flex-wrap gap-2">
          {userData.equipment.map(eq => {
            const eqInfo = EQUIPMENT_OPTIONS.find(e => e.value === eq);
            return (
              <div
                key={eq}
                className="bg-gray-700/50 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <span>{eqInfo?.emoji}</span>
                <span className="text-sm">{eqInfo?.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Generate Plan Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            onClick={onGeneratePlan}
            disabled={isGeneratingAI}
            className="text-lg px-10 py-4"
          >
            Generate Plan 🚀
          </Button>

          <button
            onClick={hasPass ? onGenerateAIPlan : onBuyPremium}
            disabled={isGeneratingAI || isStartingCheckout}
            className={[
              'text-lg px-10 py-4 rounded-xl font-semibold transition relative overflow-hidden',
              'border bg-gradient-to-br from-purple-600 to-cyan-500 border-transparent text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40',
              isGeneratingAI || isStartingCheckout ? 'opacity-70 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {isGeneratingAI ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Generating with AI…
              </span>
            ) : isStartingCheckout ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Opening checkout…
              </span>
            ) : hasPass ? (
              <span className="inline-flex items-center gap-2">
                <span>✨ Generate AI Plan</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <span>✨ Unlock AI Plan</span>
                {premiumPrice && (
                  <span className="text-xs uppercase tracking-wide bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full">
                    {premiumPrice}
                  </span>
                )}
              </span>
            )}
          </button>
        </div>
        {hasPass && passExpiryLabel && (
          <p className="text-emerald-400/90 text-sm text-center">
            ✓ AI season pass active — unlimited plans through {passExpiryLabel}
          </p>
        )}
        <p className="text-gray-500 text-sm text-center max-w-xl">
          The free plan uses a periodized template tuned to your inputs. The AI
          plan is generated by Claude with deeper personalization to your
          position, injuries, and equipment
          {!hasPass && premiumPrice
            ? ` — ${premiumPrice} unlocks unlimited AI plans for your ${userData.weeksAvailable}-week season`
            : ''}
          .
        </p>
      </motion.div>
    </motion.div>
  );
};
