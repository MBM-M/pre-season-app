import { motion } from 'framer-motion';

interface LandingProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

/**
 * Public marketing page shown to signed-out visitors. CTAs route to:
 *   - "Build my plan" / "Get started" → onboarding
 *   - "Sign in" → Clerk sign-in screen
 *
 * Signed-in users are routed straight past this by the auth effect in App.tsx.
 */
export const Landing = ({ onGetStarted, onSignIn }: LandingProps) => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 overflow-x-hidden">
      <Nav onSignIn={onSignIn} onGetStarted={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <FilterStrip />
      <HowItWorks />
      <FeatureGrid />
      <Phases />
      <Pricing onGetStarted={onGetStarted} />
      <FinalCTA onGetStarted={onGetStarted} onSignIn={onSignIn} />
      <Footer />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Nav
// ─────────────────────────────────────────────────────────────────────────────

const Nav = ({
  onSignIn,
  onGetStarted,
}: {
  onSignIn: () => void;
  onGetStarted: () => void;
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-gray-950/70 border-b border-gray-900">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-gray-950">
            P
          </div>
          <span className="font-semibold tracking-tight">Pre-Season</span>
          <span className="text-xs text-gray-500 hidden sm:inline">'26</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="#how" className="hover:text-white transition">
            How it works
          </a>
          <a href="#features" className="hover:text-white transition">
            Features
          </a>
          <a href="#phases" className="hover:text-white transition">
            Phases
          </a>
          <a href="#pricing" className="hover:text-white transition">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSignIn}
            className="text-sm text-gray-300 hover:text-white transition px-3 py-2"
          >
            Sign in
          </button>
          <button
            onClick={onGetStarted}
            className="text-sm font-semibold bg-gradient-to-br from-emerald-400 to-cyan-500 text-gray-950 px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition"
          >
            Build my plan →
          </button>
        </div>
      </nav>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────

const Hero = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <section className="relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.10),transparent_60%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            PRE-SEASON WINDOW OPENS JUNE 24
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
            Build a pre-season that fits
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              your body, not the team's.
            </span>
          </h1>

          <p className="text-gray-400 text-lg mb-8 max-w-xl leading-relaxed">
            Pre-Season is a periodized 4–10 week plan personalized to your position,
            fitness, equipment, and injuries. One questionnaire. Eight weeks of
            preparation. Match-ready when your teammates are still finding their
            breath.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <button
              onClick={onGetStarted}
              className="text-base font-semibold bg-gradient-to-br from-emerald-400 to-cyan-500 text-gray-950 px-6 py-3.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition inline-flex items-center justify-center gap-2"
            >
              Build my plan →
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('how');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-base font-medium bg-gray-900/60 border border-gray-800 text-gray-200 hover:bg-gray-900 px-6 py-3.5 rounded-xl transition inline-flex items-center justify-center gap-2"
            >
              <span className="text-emerald-400 font-mono text-sm">02:14</span>
              See it work
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-md">
            <Stat value="8" label="steps to plan" />
            <Stat value="4–10" label="week windows" />
            <Stat value="1,400+" label="tagged exercises" />
          </div>
        </motion.div>

        {/* Mock dashboard preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <MockDashboard />
        </motion.div>
      </div>
    </section>
  );
};

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div>
    <div className="font-mono text-2xl font-bold text-emerald-400">{value}</div>
    <div className="text-xs text-gray-400 mt-0.5">{label}</div>
  </div>
);

const MockDashboard = () => (
  <div className="relative rounded-2xl border border-gray-800 bg-gray-900/80 shadow-2xl shadow-emerald-500/10">
    {/* Browser chrome */}
    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
      <span className="ml-4 text-xs text-gray-500 font-mono">
        app.preseason.run / dashboard
      </span>
    </div>

    <div className="p-5 space-y-4">
      {/* Your Plan card */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide font-mono text-emerald-300 mb-1">
            Your plan
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">9</span>
            <span className="text-sm text-gray-400">of 24 complete</span>
            <span className="text-xs text-gray-500">(38%)</span>
          </div>
        </div>
        <button className="text-xs font-medium bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-md">
          View plan →
        </button>
      </div>

      {/* Metric pills */}
      <div className="grid grid-cols-3 gap-3">
        <MetricPill label="Duration" value="8" suffix="weeks" color="emerald" />
        <MetricPill label="Frequency" value="4" suffix="days / wk" color="cyan" />
        <MetricPill label="Position" value="MID" suffix="forward role" color="purple" />
      </div>

      {/* Projection chart */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-wide font-mono text-gray-400">
            Week-by-week projection
          </div>
          <div className="text-xs font-medium text-emerald-400">+47% overall</div>
        </div>
        <ProjectionChart />
        <div className="flex justify-between text-[10px] text-gray-500 mt-2 px-1">
          <span>W1</span>
          <span>W5</span>
          <span>W8</span>
        </div>
      </div>

      {/* Day strip */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <DayCard day="Mon" title="Foundation run" duration="35 min" done />
        <DayCard day="Tue" title="Strength · lower" duration="45 min" done />
        <DayCard day="Wed" title="Rest / mobility" duration="20 min" />
        <DayCard day="Thu" title="Sprint intervals" duration="30 min" today />
      </div>
    </div>

    {/* Knee filter toast (decorative overlay) */}
    <div className="absolute top-24 -left-2 sm:left-4 rounded-lg border border-red-500/40 bg-gray-900/95 backdrop-blur px-3 py-2 text-xs shadow-xl">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-red-300 font-semibold">Knee filter active</span>
      </div>
      <div className="text-gray-400 mt-0.5">14 exercises rerouted</div>
    </div>

    {/* Peak Week 5 chip — sits near the end of the projection curve */}
    <div className="absolute bottom-32 right-2 sm:-right-3 rounded-lg border border-emerald-500/40 bg-gray-900/95 backdrop-blur px-3 py-2 text-xs shadow-xl">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">
          P3
        </span>
        <span className="text-gray-100 font-semibold">Peak · Week 5</span>
      </div>
      <div className="font-mono text-gray-400 mt-0.5">+11% vs last week</div>
    </div>
  </div>
);

const MetricPill = ({
  label,
  value,
  suffix,
  color,
}: {
  label: string;
  value: string;
  suffix: string;
  color: 'emerald' | 'cyan' | 'purple';
}) => {
  const colorClasses = {
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
  }[color];
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-3">
      <div className="text-[10px] uppercase tracking-wide font-mono text-gray-500 mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-xl font-bold ${colorClasses}`}>{value}</span>
        <span className="text-[10px] text-gray-500">{suffix}</span>
      </div>
    </div>
  );
};

const ProjectionChart = () => (
  <svg viewBox="0 0 280 90" className="w-full h-20" preserveAspectRatio="none">
    <defs>
      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity="0.4" />
        <stop offset="100%" stopColor="rgb(52,211,153)" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* Phase backgrounds */}
    {[0, 70, 140, 210].map((x, i) => (
      <rect
        key={i}
        x={x}
        y={0}
        width={70}
        height={90}
        fill={i % 2 ? 'rgba(255,255,255,0.02)' : 'transparent'}
      />
    ))}
    {/* Dashed horizontal guides */}
    {[20, 45, 70].map((y) => (
      <line
        key={y}
        x1={0}
        x2={280}
        y1={y}
        y2={y}
        stroke="rgb(55,65,81)"
        strokeDasharray="2 4"
      />
    ))}
    {/* Curve fill */}
    <path
      d="M0,75 C40,72 60,60 90,52 C120,44 150,30 190,22 C220,16 250,12 280,10 L280,90 L0,90 Z"
      fill="url(#chartFill)"
    />
    {/* Curve line */}
    <path
      d="M0,75 C40,72 60,60 90,52 C120,44 150,30 190,22 C220,16 250,12 280,10"
      fill="none"
      stroke="rgb(52,211,153)"
      strokeWidth="2"
    />
    {/* End dot */}
    <circle cx="280" cy="10" r="3.5" fill="rgb(52,211,153)" />
    <circle cx="280" cy="10" r="6" fill="rgb(52,211,153)" fillOpacity="0.3" />
    {/* Phase labels */}
    {['Foundation', 'Build', 'Peak', 'Taper'].map((label, i) => (
      <text
        key={label}
        x={i * 70 + 35}
        y={86}
        textAnchor="middle"
        fontSize="6"
        fill="rgb(75,85,99)"
        fontFamily="ui-monospace, monospace"
      >
        {label.toUpperCase()}
      </text>
    ))}
  </svg>
);

const DayCard = ({
  day,
  title,
  duration,
  done,
  today,
}: {
  day: string;
  title: string;
  duration: string;
  done?: boolean;
  today?: boolean;
}) => (
  <div
    className={`rounded-lg border p-2 ${
      today
        ? 'border-emerald-500/50 bg-emerald-500/10'
        : 'border-gray-800 bg-gray-900/40'
    }`}
  >
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] uppercase tracking-wide font-mono text-gray-500">{day}</span>
      {done && <span className="text-emerald-400 text-xs">✓</span>}
      {today && (
        <span className="text-[9px] uppercase font-semibold text-emerald-300 bg-emerald-500/20 px-1.5 rounded-full">
          today
        </span>
      )}
    </div>
    <div className="text-xs font-medium truncate">{title}</div>
    <div className="text-[10px] text-gray-500">{duration}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Filter strip — decorative scrolling pills
// ─────────────────────────────────────────────────────────────────────────────

const FilterStrip = () => {
  const pills = [
    'Endurance',
    'Strength',
    'Speed',
    'Skills',
    'Knee filter',
    'Ankle filter',
    'Back filter',
    'Goalkeeper',
    'Defender',
    'Midfielder',
    'Forward',
    'Open field',
    'Gym membership',
    'Football',
    'Resistance bands',
    'Endurance',
    'Speed',
    'Skills',
  ];
  return (
    <section className="border-y border-gray-900 py-10 overflow-hidden">
      <div className="text-center text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500 mb-6">
        Tagged by position, equipment, goal & injury filter
      </div>
      <div className="flex gap-2 flex-wrap justify-center max-w-6xl mx-auto px-4">
        {pills.map((p, i) => (
          <span
            key={i}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-800 bg-gray-900/60 text-gray-300"
          >
            {p}
          </span>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// "Eight short questions. One periodized plan."
// ─────────────────────────────────────────────────────────────────────────────

const HowItWorks = () => {
  const steps = [
    {
      step: 'STEP 01',
      title: 'Region',
      body: "UK / Ireland, Canada / USA, or other — we localize terminology and seasons.",
    },
    {
      step: 'STEP 02',
      title: 'Position',
      body: 'Goalkeeper, defender, midfielder, or forward. Drills bubble to the top.',
    },
    {
      step: 'STEP 03',
      title: 'Fitness',
      body: 'Beginner, intermediate, advanced. Sets your starting intensity.',
    },
    {
      step: 'STEP 04',
      title: 'Timeline',
      body: '4, 6, 8, or 10+ weeks. Determines how phases compress or breathe.',
    },
    {
      step: 'STEP 05',
      title: 'Days/wk',
      body: '2 to 5. We never overlap heavy days and we honor your real life.',
    },
    {
      step: 'STEP 06',
      title: 'Equipment',
      body: 'Field, gym, ball, bands. Sessions only use what you have.',
    },
    {
      step: 'STEP 07',
      title: 'Injuries',
      body: 'Knee, ankle, back, other. Exercises tagged by body part get filtered.',
    },
    {
      step: 'STEP 08',
      title: 'Goal',
      body: 'Endurance, strength, speed, skills, weight-loss. Tilts the volume mix.',
    },
  ];
  return (
    <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-12">
        <div className="text-xs uppercase tracking-[0.2em] font-mono text-gray-500 mb-3">
          How it works
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <h2 className="font-display text-4xl font-bold tracking-tight">
            Eight short questions.
            <br />
            <span className="text-emerald-400">One periodized plan.</span>
          </h2>
          <p className="text-gray-400 leading-relaxed md:pt-3">
            Not a quiz that returns a generic six-week PDF. Each answer narrows the
            exercise pool, weights the volume curve, or rotates a drill set. Same
            inputs, same plan, every time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((s) => (
          <div
            key={s.step}
            className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 hover:border-emerald-500/30 transition"
          >
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500 mb-2">
              {s.step}
            </div>
            <div className="text-lg font-semibold mb-2">{s.title}</div>
            <div className="text-sm text-gray-400 leading-relaxed">{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// "A plan that respects what you actually bring."
// ─────────────────────────────────────────────────────────────────────────────

const FeatureGrid = () => {
  const features = [
    {
      tag: 'Position-aware',
      title: "Goalkeepers don't train like forwards.",
      body: 'Position-specific drills — keeper handling, defender 1v1s, midfielder/forward shooting, aerial duels — bubble to the top of every session pool when you pick a position.',
    },
    {
      tag: 'Injury filter',
      title: 'Tagged by body part, not by name.',
      body: 'Every exercise carries tags for the joints it loads — knee, ankle, back, hamstring, shoulder. A declared injury removes them structurally. No more pattern-matching exercise names.',
    },
    {
      tag: 'Periodized',
      title: 'Foundation → Build → Peak → Taper.',
      body: 'Intensity rises through four phases and lands you at peak for week 0. Drills rotate week-to-week so it never feels like the same Tuesday twice.',
    },
    {
      tag: 'Equipment-fit',
      title: 'Plans the kit you actually have.',
      body: 'Open field only? Gym + bands? Just a ball? Sessions are generated against your inventory — never against the inventory of a sports lab.',
    },
    {
      tag: 'Progress tracking',
      title: 'Tick the session. Keep the streak.',
      body: 'Mark sessions complete on the day. The dashboard rolls up percent-complete and surfaces what\'s next, so the plan answers the question "what do I do today?"',
    },
    {
      tag: 'Premium · AI',
      title: 'Or have Claude write you a one-off.',
      body: 'The premium tier swaps the template engine for a server-side Claude call. Same JSON contract, deeper personalization across position, injuries, equipment, and goal.',
    },
  ];
  return (
    <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-12">
        <div className="text-xs uppercase tracking-[0.2em] font-mono text-gray-500 mb-3">
          What makes it different
        </div>
        <h2 className="text-4xl font-bold tracking-tight">
          A plan that respects
          <br />
          <span className="text-emerald-400">what you actually bring.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 hover:border-emerald-500/30 transition"
          >
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-400 mb-3">
              {f.tag}
            </div>
            <h3 className="text-lg font-semibold mb-3 leading-snug">{f.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Phases — big periodization chart
// ─────────────────────────────────────────────────────────────────────────────

const Phases = () => {
  const phases = [
    {
      name: 'Foundation',
      body: "Re-introduce load. Aerobic base, joint prep, technique resets. Sessions feel hard but dignified; recovery improves quickly.",
    },
    {
      name: 'Build',
      body: 'Stack the volume. Tempo runs, strength blocks, position-specific drills. Sustained efforts feel easier; sleep and energy noticeably better.',
    },
    {
      name: 'Peak',
      body: "Sharpen. Sprints, change-of-direction, contact prep. Sprints, jumps, and tackles feel decisive. Confidence builds.",
    },
    {
      name: 'Taper',
      body: 'Arrive fresh. Cut volume, keep intensity. You hit pre-season camp ahead of teammates — not cooked on day one.',
    },
  ];
  return (
    <section id="phases" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mb-12">
        <div className="text-xs uppercase tracking-[0.2em] font-mono text-gray-500 mb-3">
          The four phases
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <h2 className="font-display text-4xl font-bold tracking-tight">
            Don't just train more.
            <br />
            <span className="text-emerald-400">Train in the right order.</span>
          </h2>
          <p className="text-gray-400 leading-relaxed md:pt-3">
            Periodization is just the obvious idea that the work you do in week one
            shouldn't be the work you do in week eight. Pre-Season turns it into a
            calendar.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs uppercase tracking-[0.2em] font-mono text-gray-500">
            Intensity · 8 weeks
          </div>
          <div className="text-xs font-medium text-emerald-400">+47% projected gain</div>
        </div>
        <BigChart />
        <div className="grid grid-cols-4 mt-3 text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500">
          <span className="text-center">Foundation</span>
          <span className="text-center">Build</span>
          <span className="text-center">Peak</span>
          <span className="text-center">Taper</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {phases.map((p) => (
          <div
            key={p.name}
            className="rounded-xl border border-gray-800 bg-gray-900/40 p-5"
          >
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-400 mb-2">
              {p.name}
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const BigChart = () => (
  <svg viewBox="0 0 800 200" className="w-full h-48" preserveAspectRatio="none">
    <defs>
      <linearGradient id="bigFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity="0.3" />
        <stop offset="100%" stopColor="rgb(52,211,153)" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* Vertical phase dividers */}
    {[200, 400, 600].map((x) => (
      <line
        key={x}
        x1={x}
        x2={x}
        y1={0}
        y2={200}
        stroke="rgb(31,41,55)"
        strokeDasharray="3 6"
      />
    ))}
    {/* Horizontal grid */}
    {[40, 80, 120, 160].map((y) => (
      <line
        key={y}
        x1={0}
        x2={800}
        y1={y}
        y2={y}
        stroke="rgb(31,41,55)"
        strokeDasharray="2 6"
      />
    ))}
    {/* Curve fill */}
    <path
      d="M0,170 C100,165 150,150 200,130 C260,108 320,85 400,65 C480,45 540,30 600,28 C660,32 720,50 800,55 L800,200 L0,200 Z"
      fill="url(#bigFill)"
    />
    {/* Curve line */}
    <path
      d="M0,170 C100,165 150,150 200,130 C260,108 320,85 400,65 C480,45 540,30 600,28 C660,32 720,50 800,55"
      fill="none"
      stroke="rgb(52,211,153)"
      strokeWidth="2.5"
    />
    {/* Peak dot */}
    <circle cx="600" cy="28" r="5" fill="rgb(52,211,153)" />
    <circle cx="600" cy="28" r="10" fill="rgb(52,211,153)" fillOpacity="0.25" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Pricing
// ─────────────────────────────────────────────────────────────────────────────

const Pricing = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-12">
        <div className="text-xs uppercase tracking-[0.2em] font-mono text-gray-500 mb-3">
          Pricing
        </div>
        <h2 className="font-display text-4xl font-bold tracking-tight">
          Free, until it isn't enough.
        </h2>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          The template engine produces a real, periodized plan. Premium swaps it for a
          Claude-generated one when you want the deeper personalization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-8">
          <div className="flex items-baseline justify-between mb-1">
            <div>
              <h3 className="text-2xl font-bold">Free</h3>
              <div className="text-sm text-gray-400 mt-1">
                Template engine, deterministic
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">£0</div>
              <div className="text-xs text-gray-500">forever</div>
            </div>
          </div>
          <ul className="space-y-2 mt-6 mb-8 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              Full 4–10 week periodized plan
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              Position-aware drill weighting
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              Injury-tagged exercise filter
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              Equipment-matched sessions
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              Workout completion tracking
            </li>
          </ul>
          <button
            onClick={onGetStarted}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Start free →
          </button>
        </div>

        {/* Premium */}
        <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 p-8 relative">
          <div className="absolute -top-3 right-6 text-[10px] uppercase tracking-[0.2em] font-mono bg-purple-500 text-white px-2 py-1 rounded-full font-semibold">
            AI
          </div>
          <div className="flex items-baseline justify-between mb-1">
            <div>
              <h3 className="text-2xl font-bold">Premium</h3>
              <div className="text-sm text-gray-400 mt-1">Claude-generated, structured</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">£6</div>
              <div className="text-xs text-gray-500">one-off</div>
            </div>
          </div>
          <ul className="space-y-2 mt-6 mb-8 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-purple-400">✓</span>
              Everything in Free
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400">✓</span>
              Claude Sonnet plan generation
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400">✓</span>
              Per-session reasoning &amp; alternates
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400">✓</span>
              Re-generate as inputs change
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400">✓</span>
              One plan, your season — no subscription
            </li>
          </ul>
          <button
            onClick={onGetStarted}
            className="w-full bg-gradient-to-br from-purple-500 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition"
          >
            Generate with Claude →
          </button>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Final CTA
// ─────────────────────────────────────────────────────────────────────────────

const FinalCTA = ({
  onGetStarted,
  onSignIn,
}: {
  onGetStarted: () => void;
  onSignIn: () => void;
}) => (
  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
    <div className="text-xs uppercase tracking-[0.2em] font-mono text-gray-500 mb-3">
      Season opens in 40 days
    </div>
    <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">
      Eight questions.
      <br />
      <span className="text-emerald-400">Then start training.</span>
    </h2>
    <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
      Don't turn up to camp on borrowed legs. Build a plan in the time it takes to
      finish a coffee, and put the first session in the calendar tonight.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onClick={onGetStarted}
        className="text-base font-semibold bg-gradient-to-br from-emerald-400 to-cyan-500 text-gray-950 px-6 py-3.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition"
      >
        Build my plan →
      </button>
      <button
        onClick={onSignIn}
        className="text-base font-medium bg-gray-900/60 border border-gray-800 text-gray-200 hover:bg-gray-900 px-6 py-3.5 rounded-xl transition"
      >
        Sign in
      </button>
    </div>
    <div className="text-xs text-gray-500 mt-6 tracking-wide">
      Free forever · No card · 1 min sign-up
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="border-t border-gray-900 py-8 text-sm text-gray-500">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-gray-950">
          P
        </div>
        <span>Pre-Season</span>
        <span className="text-gray-700">·</span>
        <span>'26</span>
      </div>
      <div className="flex items-center gap-4">
        <span>Built by MBM-M</span>
        <a
          href="https://github.com/MBM-M/pre-season-app"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition"
        >
          GitHub
        </a>
        <a href="#" className="hover:text-white transition">
          Privacy
        </a>
        <a href="#" className="hover:text-white transition">
          Contact
        </a>
      </div>
    </div>
  </footer>
);
