import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { OnboardingData, GOAL_OPTIONS } from '@/types/onboarding';
import { computeProjection, MetricProjection } from '@/lib/improvementProjection';
import { Button } from '@/components/ui/Button';

interface ImprovementVisionProps {
  data: OnboardingData;
  onContinue: () => void;
  onBack: () => void;
  ctaLabel?: string;
}

export const ImprovementVision = ({
  data,
  onContinue,
  onBack,
  ctaLabel = 'Create my account →',
}: ImprovementVisionProps) => {
  const projection = useMemo(() => computeProjection(data), [data]);
  const goalInfo = GOAL_OPTIONS.find((g) => g.value === data.goal);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-4">
          <span>{goalInfo?.emoji}</span>
          <span>Your {projection.weeks}-week projection</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
          In {projection.weeks} weeks, you could be{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            <CountUp to={projection.overallGain} />% fitter
          </span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Here's the realistic transformation a {data.daysPerWeek}-day-a-week plan can deliver for a{' '}
          <span className="text-gray-200">{data.fitnessLevel}</span> athlete focused on{' '}
          <span className="text-gray-200">{goalInfo?.label.toLowerCase()}</span>.
        </p>
      </motion.div>

      {/* Weekly progression curve */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide font-semibold">
            Week-by-week progression
          </h3>
          <span className="text-sm text-emerald-400 font-medium">
            +{projection.overallGain}% overall
          </span>
        </div>
        <ProgressionChart curve={projection.weeklyCurve} />
      </motion.div>

      {/* Per-metric bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 mb-6"
      >
        <h3 className="text-sm text-gray-400 uppercase tracking-wide font-semibold mb-5">
          Where you'll improve
        </h3>
        <div className="space-y-4">
          {projection.metrics.map((m, i) => (
            <MetricBar key={m.metric} metric={m} delay={0.4 + i * 0.1} />
          ))}
        </div>
      </motion.div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 mb-8"
      >
        <h3 className="text-sm text-gray-400 uppercase tracking-wide font-semibold mb-4">
          What you'll feel along the way
        </h3>
        <Milestones weeks={projection.weeks} />
      </motion.div>

      {/* Footnote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-xs text-gray-500 text-center mb-6 max-w-2xl mx-auto"
      >
        Projections are modelled on training-science research into pre-season conditioning.
        Actual results depend on consistency, recovery, and nutrition.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="primary" onClick={onContinue} className="text-lg px-10 py-4">
          {ctaLabel}
        </Button>
      </motion.div>
    </div>
  );
};

/* ---------- Sub-components ---------- */

const CountUp = ({ to }: { to: number }) => {
  // Lightweight count-up using framer-motion's animate-on-mount via key trick.
  // We render via animation by interpolating a CSS variable.
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {to}
    </motion.span>
  );
};

interface MetricBarProps {
  metric: MetricProjection;
  delay: number;
}

const MetricBar = ({ metric, delay }: MetricBarProps) => {
  // Width is the gain itself (e.g. 35% gain → 35% bar). Cap visual at ~80%
  // of container so the bars feel like there's headroom; primary metric gets
  // a slightly stronger treatment.
  const widthPct = Math.min(95, metric.gain * 1.5);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{metric.emoji}</span>
          <span className={`font-medium ${metric.primary ? 'text-emerald-400' : 'text-gray-200'}`}>
            {metric.label}
          </span>
          {metric.primary && (
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Primary focus
            </span>
          )}
        </div>
        <span className={`text-sm font-bold tabular-nums ${metric.primary ? 'text-emerald-400' : 'text-gray-300'}`}>
          +{metric.gain}%
        </span>
      </div>
      <div className="h-3 bg-gray-900/80 rounded-full overflow-hidden border border-gray-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 1.0, delay, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${
            metric.primary
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'bg-gradient-to-r from-gray-600 to-gray-500'
          }`}
        />
      </div>
    </div>
  );
};

interface ProgressionChartProps {
  curve: number[];
}

const ProgressionChart = ({ curve }: ProgressionChartProps) => {
  const width = 600;
  const height = 140;
  const padX = 24;
  const padY = 18;
  const max = Math.max(...curve, 1);

  const points = curve.map((v, i) => {
    const x = padX + ((width - padX * 2) * i) / Math.max(curve.length - 1, 1);
    const y = height - padY - ((height - padY * 2) * v) / max;
    return { x, y, v, week: i + 1 };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label="Weekly progression curve"
    >
      <defs>
        <linearGradient id="progressionFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="progressionLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgb(16,185,129)" />
          <stop offset="100%" stopColor="rgb(34,211,238)" />
        </linearGradient>
      </defs>

      {/* horizontal grid lines */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={padX}
          x2={width - padX}
          y1={padY + (height - padY * 2) * t}
          y2={padY + (height - padY * 2) * t}
          stroke="rgb(31,41,55)"
          strokeDasharray="3 4"
        />
      ))}

      {/* area fill */}
      <motion.path
        d={areaD}
        fill="url(#progressionFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />

      {/* line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#progressionLine)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }}
      />

      {/* end point */}
      <motion.circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={5}
        fill="rgb(16,185,129)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.7, type: 'spring', stiffness: 300 }}
      />
      <motion.circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={5}
        fill="none"
        stroke="rgb(16,185,129)"
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 2.4, opacity: 0 }}
        transition={{ delay: 1.7, duration: 1.4, repeat: Infinity }}
      />

      {/* week labels — show first, middle, last */}
      {[0, Math.floor(points.length / 2), points.length - 1].map((i) => (
        <text
          key={i}
          x={points[i].x}
          y={height - 4}
          textAnchor="middle"
          fontSize="10"
          fill="rgb(107,114,128)"
        >
          Week {points[i].week}
        </text>
      ))}
    </svg>
  );
};

interface MilestonesProps {
  weeks: number;
}

const Milestones = ({ weeks }: MilestonesProps) => {
  // Pick 3-4 milestones spaced across the plan.
  const items: { week: number; label: string; detail: string }[] = [];

  items.push({
    week: 1,
    label: 'Baseline & habit',
    detail: 'Sessions feel hard but doable. Recovery improves quickly.',
  });

  if (weeks >= 4) {
    items.push({
      week: Math.ceil(weeks / 3),
      label: 'Cardio kicks in',
      detail: 'Sustained efforts feel easier. Sleep and energy noticeably better.',
    });
  }

  if (weeks >= 6) {
    items.push({
      week: Math.ceil((2 * weeks) / 3),
      label: 'Strength shows up',
      detail: 'Sprints, jumps, and tackles feel sharper. Confidence builds.',
    });
  }

  items.push({
    week: weeks,
    label: 'Match-ready',
    detail: 'Peak conditioning. You hit pre-season camp ahead of teammates.',
  });

  return (
    <div className="relative">
      {/* vertical track */}
      <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-700/60" aria-hidden="true" />
      <div className="space-y-4">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="relative w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center flex-shrink-0 z-10">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wide text-emerald-400 font-semibold">
                  Week {item.week}
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">{item.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
