import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { TrainingPlan, WorkoutSession } from '@/lib/planGenerator';
import { Button } from '@/components/ui/Button';

interface TrainingPlanProps {
  plan: TrainingPlan;
  onSavePlan: () => void;
}

export const TrainingPlanDisplay = ({ plan, onSavePlan }: TrainingPlanProps) => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

  const currentWeek = plan.weeks[selectedWeek];

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
        {plan.weeks.map((week, index) => (
          <button
            key={week.weekNumber}
            onClick={() => setSelectedWeek(index)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedWeek === index
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Week {week.weekNumber}
          </button>
        ))}
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
              {currentWeek.sessions.map((session, index) => (
                <SessionCard
                  key={session.day}
                  session={session}
                  isExpanded={expandedSession === index}
                  onToggle={() => setExpandedSession(expandedSession === index ? null : index)}
                />
              ))}
            </div>

            {/* Week Tips */}
            <div className="mt-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <h3 className="font-semibold text-cyan-400 mb-2">💡 Tips for Week {currentWeek.weekNumber}</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                {currentWeek.tips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Recommendations */}
        <div className="space-y-6">
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
                <span className="font-bold">
                  {plan.weeks.reduce((sum, week) => sum + week.sessions.length, 0)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Button variant="primary" onClick={onSavePlan} className="w-full">
              Save This Plan
            </Button>
            <Button variant="ghost" onClick={() => window.print()} className="w-full">
              Print Plan 🖨️
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
  onToggle: () => void;
}

const SessionCard = ({ session, isExpanded, onToggle }: SessionCardProps) => {
  const intensityColors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="border border-gray-700/50 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            {session.day}
          </div>
          <div className="text-left">
            <div className="font-semibold">{session.title}</div>
            <div className="text-sm text-gray-400">{session.focus} • {session.duration}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${intensityColors[session.intensity]}`}>
            {session.intensity}
          </span>
          <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} className="text-gray-400">
            ▼
          </motion.span>
        </div>
      </button>

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
                        {exercise.sets && exercise.reps ? `${exercise.sets} × ${exercise.reps}` : exercise.reps}
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
