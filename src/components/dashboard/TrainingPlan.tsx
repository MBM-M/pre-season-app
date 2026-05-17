import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { TrainingPlan, WorkoutSession } from '@/lib/planGenerator';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  getCompletions,
  markSessionComplete,
  unmarkSessionComplete,
} from '@/lib/database';

interface TrainingPlanProps {
  plan: TrainingPlan;
  planId: string | null;
  clerkUserId: string;
}

/** Composite key used to identify a session in the completion set. */
const sessionKey = (weekNumber: number, day: number) => `${weekNumber}-${day}`;

export const TrainingPlanDisplay = ({
  plan,
  planId,
  clerkUserId,
}: TrainingPlanProps) => {
  const toast = useToast();
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  // Sessions currently mid-toggle — disables their button so a fast double-click
  // can't desync local optimistic state from the server.
  const [pending, setPending] = useState<Set<string>>(new Set());

  // Load existing completions whenever we have a plan id.
  useEffect(() => {
    // No plan → useState defaults to an empty Set, which is the correct view.
    if (!planId) return;
    let cancelled = false;
    getCompletions(planId)
      .then((rows) => {
        if (cancelled) return;
        setCompleted(new Set(rows.map((r) => sessionKey(r.weekNumber, r.day))));
      })
      .catch((err) => {
        console.error('Error loading completions:', err);
        toast.error('Could not load your workout history.');
      });
    return () => {
      cancelled = true;
    };
  }, [planId, toast]);

  const currentWeek = plan.weeks[selectedWeek];

  const totalSessions = useMemo(
    () => plan.weeks.reduce((sum, w) => sum + w.sessions.length, 0),
    [plan]
  );
  const completedCount = completed.size;
  const completionPct = totalSessions
    ? Math.round((completedCount / totalSessions) * 100)
    : 0;

  const handleToggle = async (weekNumber: number, day: number) => {
    if (!planId) {
      toast.info(
        "Plan isn't saved yet, so progress can't be tracked. Regenerate the plan to retry."
      );
      return;
    }
    const key = sessionKey(weekNumber, day);
    if (pending.has(key)) return;

    const wasComplete = completed.has(key);

    // Optimistic update
    setCompleted((prev) => {
      const next = new Set(prev);
      if (wasComplete) next.delete(key);
      else next.add(key);
      return next;
    });
    setPending((prev) => new Set(prev).add(key));

    try {
      if (wasComplete) {
        await unmarkSessionComplete(clerkUserId, planId, weekNumber, day);
      } else {
        await markSessionComplete(clerkUserId, planId, weekNumber, day);
      }
    } catch (err) {
      console.error('Error toggling completion:', err);
      // Revert
      setCompleted((prev) => {
        const next = new Set(prev);
        if (wasComplete) next.add(key);
        else next.delete(key);
        return next;
      });
      toast.error("Couldn't save that change. Please try again.");
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // Per-week completion for the week selector pips.
  const weekCompletion = (weekIndex: number) => {
    const week = plan.weeks[weekIndex];
    const done = week.sessions.filter((s) =>
      completed.has(sessionKey(week.weekNumber, s.day))
    ).length;
    return { done, total: week.sessions.length };
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl font-bold mb-4">Your Training Plan</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">{plan.summary}</p>
      </motion.div>

      {/* Week Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center gap-2 mb-8 flex-wrap"
      >
        {plan.weeks.map((week, index) => {
          const { done, total } = weekCompletion(index);
          const allDone = done === total && total > 0;
          return (
            <button
              key={week.weekNumber}
              onClick={() => setSelectedWeek(index)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                selectedWeek === index
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span>Week {week.weekNumber}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  allDone
                    ? 'bg-emerald-400/30 text-emerald-100'
                    : selectedWeek === index
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {done}/{total}
              </span>
            </button>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Weekly Plan */}
        <div className="lg:col-span-2">
          <motion.div
            key={selectedWeek}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
          >
            {/* Week Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-bold">Week {currentWeek.weekNumber}</h2>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                  {currentWeek.focus}
                </span>
              </div>
            </div>

            {/* Sessions */}
            <div className="space-y-4">
              {currentWeek.sessions.map((session, index) => {
                const key = sessionKey(currentWeek.weekNumber, session.day);
                return (
                  <SessionCard
                    key={session.day}
                    session={session}
                    isExpanded={expandedSession === index}
                    isComplete={completed.has(key)}
                    isPending={pending.has(key)}
                    onToggleExpand={() =>
                      setExpandedSession(expandedSession === index ? null : index)
                    }
                    onToggleComplete={() =>
                      handleToggle(currentWeek.weekNumber, session.day)
                    }
                  />
                );
              })}
            </div>

            {/* Week Tips */}
            <div className="mt-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <h3 className="font-semibold text-cyan-400 mb-2">
                Tips for Week {currentWeek.weekNumber}
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                {currentWeek.tips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/30 p-6"
          >
            <h3 className="text-xl font-bold mb-3">Plan Progress</h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-bold text-emerald-400">
                {completedCount}
              </span>
              <span className="text-gray-400 text-sm">
                of {totalSessions} sessions
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
              />
            </div>
            <div className="text-xs text-gray-400">{completionPct}% complete</div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
          >
            <h3 className="text-xl font-bold mb-4">Recommendations</h3>
            <ul className="space-y-3">
              {plan.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Plan Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
          >
            <h3 className="text-xl font-bold mb-4">Plan Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Weeks</span>
                <span className="font-bold">{plan.weeks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sessions/Week</span>
                <span className="font-bold">{currentWeek.sessions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Sessions</span>
                <span className="font-bold">{totalSessions}</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="ghost"
              onClick={() => window.print()}
              className="w-full"
            >
              Print Plan
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

interface SessionCardProps {
  session: WorkoutSession;
  isExpanded: boolean;
  isComplete: boolean;
  isPending: boolean;
  onToggleExpand: () => void;
  onToggleComplete: () => void;
}

const SessionCard = ({
  session,
  isExpanded,
  isComplete,
  isPending,
  onToggleExpand,
  onToggleComplete,
}: SessionCardProps) => {
  const intensityColors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-colors ${
        isComplete
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-gray-700/50'
      }`}
    >
      <div className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition">
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-4 flex-1 text-left min-w-0"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
              isComplete
                ? 'bg-emerald-500/30 text-emerald-300 line-through'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {session.day}
          </div>
          <div className="min-w-0">
            <div
              className={`font-semibold truncate ${
                isComplete ? 'text-gray-400 line-through' : ''
              }`}
            >
              {session.title}
            </div>
            <div className="text-sm text-gray-400 truncate">
              {session.focus} • {session.duration}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${intensityColors[session.intensity]}`}
          >
            {session.intensity}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            disabled={isPending}
            aria-label={isComplete ? 'Mark session incomplete' : 'Mark session complete'}
            aria-pressed={isComplete}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
              isComplete
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-gray-500 hover:border-emerald-400 text-transparent'
            } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-gray-400 select-none"
          >
            ▼
          </motion.span>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gray-900/50 border-t border-gray-700/50">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Exercises</h4>
              <div className="space-y-3">
                {session.exercises.map((exercise, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-gray-400">
                        {exercise.sets && exercise.reps
                          ? `${exercise.sets} × ${exercise.reps}`
                          : exercise.reps}
                        {exercise.sets && !exercise.reps && `${exercise.sets} sets`}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                      {exercise.equipment}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
