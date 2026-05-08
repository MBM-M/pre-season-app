import {
  OnboardingData,
  FootballPosition,
  InjuryArea,
  Equipment,
  PrimaryGoal,
  FitnessLevel,
  WeeksAvailable,
} from '@/types/onboarding';

// ─────────────────────────────────────────────────────────────────────────────
// Public types — preserved so TrainingPlan.tsx and Dashboard keep working.
// ─────────────────────────────────────────────────────────────────────────────

export interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  equipment: string;
}

export interface WorkoutSession {
  day: number;
  title: string;
  focus: string;
  exercises: Exercise[];
  duration: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface WeeklyPlan {
  weekNumber: number;
  sessions: WorkoutSession[];
  focus: string;
  tips: string[];
}

export interface TrainingPlan {
  weeks: WeeklyPlan[];
  summary: string;
  recommendations: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal types
// ─────────────────────────────────────────────────────────────────────────────

type Category = 'endurance' | 'strength' | 'speed' | 'skills' | 'conditioning';
type BodyPart = 'knee' | 'ankle' | 'back' | 'shoulder' | 'hamstring';
type Phase = 'foundation' | 'build' | 'peak' | 'taper';

interface ExerciseDef {
  name: string;
  category: Category;
  equipment: Equipment | 'none';
  loads: BodyPart[];                    // body parts this stresses (drives injury filtering)
  positions?: FootballPosition[];       // omit = applies to all positions
  intensity: 'low' | 'medium' | 'high';
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exercise library — broad enough to rotate without repetition across phases.
// ─────────────────────────────────────────────────────────────────────────────

const LIBRARY: ExerciseDef[] = [
  // ENDURANCE — field
  { name: 'Sprint Intervals',    category: 'endurance', equipment: 'field', loads: ['ankle','hamstring'], intensity: 'high',   sets: 6, reps: '30s on, 90s off' },
  { name: 'Shuttle Runs',        category: 'endurance', equipment: 'field', loads: ['ankle','knee'],      intensity: 'high',   sets: 5, reps: '20m' },
  { name: 'Continuous Run',      category: 'endurance', equipment: 'field', loads: ['ankle'],             intensity: 'low',    sets: 1, reps: '20-30 min' },
  { name: 'Fartlek Run',         category: 'endurance', equipment: 'field', loads: ['ankle'],             intensity: 'medium', sets: 1, reps: '15 min' },
  { name: 'Tempo Run',           category: 'endurance', equipment: 'field', loads: ['ankle'],             intensity: 'medium', sets: 1, reps: '20 min steady' },
  { name: 'Beep Test Intervals', category: 'endurance', equipment: 'field', loads: ['ankle','knee'],      intensity: 'high',   sets: 1, reps: 'to fatigue' },

  // ENDURANCE — gym
  { name: 'Treadmill Intervals', category: 'endurance', equipment: 'gym', loads: ['ankle'], intensity: 'high',   sets: 6, reps: '30s on, 90s off' },
  { name: 'Rowing Machine',      category: 'endurance', equipment: 'gym', loads: ['back'],  intensity: 'medium', sets: 4, reps: '5 min' },
  { name: 'Bike Intervals',      category: 'endurance', equipment: 'gym', loads: [],        intensity: 'high',   sets: 5, reps: '2 min hard, 2 min easy' },
  { name: 'Stair Mill',          category: 'endurance', equipment: 'gym', loads: ['knee'],  intensity: 'medium', sets: 3, reps: '5 min' },

  // ENDURANCE — bodyweight
  { name: 'Jumping Jacks', category: 'endurance', equipment: 'none', loads: ['ankle'], intensity: 'low',    sets: 3, reps: '60s' },
  { name: 'Steady-State Run', category: 'endurance', equipment: 'none', loads: ['ankle'], intensity: 'low', sets: 1, reps: '15-20 min' },

  // STRENGTH — field/bodyweight
  { name: 'Plyometric Push-ups', category: 'strength', equipment: 'field', loads: ['shoulder'], intensity: 'high',   sets: 4, reps: '12' },
  { name: 'Single-Leg Squats',   category: 'strength', equipment: 'field', loads: ['knee'],     intensity: 'medium', sets: 3, reps: '10 each' },
  { name: 'Explosive Lunges',    category: 'strength', equipment: 'field', loads: ['knee'],     intensity: 'high',   sets: 3, reps: '12 each' },
  { name: 'Bodyweight Squats',   category: 'strength', equipment: 'field', loads: ['knee'],     intensity: 'low',    sets: 4, reps: '20' },
  { name: 'Push-ups',            category: 'strength', equipment: 'field', loads: ['shoulder'], intensity: 'medium', sets: 3, reps: '12-15' },
  { name: 'Plank',               category: 'strength', equipment: 'field', loads: ['back','shoulder'], intensity: 'low', sets: 3, reps: '45s' },
  { name: 'Glute Bridges',       category: 'strength', equipment: 'field', loads: [],           intensity: 'low',    sets: 3, reps: '15' },

  // STRENGTH — gym
  { name: 'Barbell Back Squat',     category: 'strength', equipment: 'gym', loads: ['knee','back'],     intensity: 'high',   sets: 4, reps: '8-10' },
  { name: 'Deadlift',                category: 'strength', equipment: 'gym', loads: ['back','hamstring'],intensity: 'high',   sets: 4, reps: '6-8' },
  { name: 'Bench Press',             category: 'strength', equipment: 'gym', loads: ['shoulder'],        intensity: 'high',   sets: 4, reps: '8-10' },
  { name: 'Romanian Deadlift',       category: 'strength', equipment: 'gym', loads: ['back','hamstring'],intensity: 'medium', sets: 3, reps: '10' },
  { name: 'Bulgarian Split Squat',   category: 'strength', equipment: 'gym', loads: ['knee'],            intensity: 'medium', sets: 3, reps: '10 each' },
  { name: 'Pull-ups',                category: 'strength', equipment: 'gym', loads: ['shoulder'],        intensity: 'medium', sets: 4, reps: '6-10' },
  { name: 'Hip Thrust',              category: 'strength', equipment: 'gym', loads: ['back'],            intensity: 'medium', sets: 4, reps: '10' },
  { name: 'Overhead Press',          category: 'strength', equipment: 'gym', loads: ['shoulder','back'], intensity: 'medium', sets: 3, reps: '8-10' },

  // STRENGTH — bands
  { name: 'Banded Squats',           category: 'strength', equipment: 'bands', loads: ['knee'],            intensity: 'medium', sets: 4, reps: '15' },
  { name: 'Banded Chest Press',      category: 'strength', equipment: 'bands', loads: ['shoulder'],        intensity: 'medium', sets: 4, reps: '12' },
  { name: 'Banded Rows',             category: 'strength', equipment: 'bands', loads: ['back'],            intensity: 'medium', sets: 4, reps: '12' },
  { name: 'Banded Romanian Deadlift',category: 'strength', equipment: 'bands', loads: ['back','hamstring'],intensity: 'medium', sets: 3, reps: '15' },
  { name: 'Banded Clamshells',       category: 'strength', equipment: 'bands', loads: [],                  intensity: 'low',    sets: 3, reps: '15 each' },
  { name: 'Monster Walks',           category: 'strength', equipment: 'bands', loads: ['knee'],            intensity: 'low',    sets: 3, reps: '20 steps' },

  // STRENGTH — bodyweight
  { name: 'Push-ups',          category: 'strength', equipment: 'none', loads: ['shoulder'], intensity: 'medium', sets: 3, reps: '12-15' },
  { name: 'Bodyweight Squats', category: 'strength', equipment: 'none', loads: ['knee'],     intensity: 'low',    sets: 4, reps: '20' },
  { name: 'Plank',             category: 'strength', equipment: 'none', loads: ['back','shoulder'], intensity: 'low', sets: 3, reps: '45s' },
  { name: 'Wall Sit',          category: 'strength', equipment: 'none', loads: ['knee'],     intensity: 'low',    sets: 3, reps: '45s' },

  // SPEED — field
  { name: '10m Sprints',          category: 'speed', equipment: 'field', loads: ['hamstring','ankle'], intensity: 'high',   sets: 8, reps: 'Max effort', rest: '60s' },
  { name: '20m Sprints',          category: 'speed', equipment: 'field', loads: ['hamstring','ankle'], intensity: 'high',   sets: 6, reps: 'Max effort', rest: '90s' },
  { name: '40m Sprints',          category: 'speed', equipment: 'field', loads: ['hamstring'],         intensity: 'high',   sets: 4, reps: 'Max effort', rest: '2 min' },
  { name: 'Agility Ladder',       category: 'speed', equipment: 'field', loads: ['ankle'],             intensity: 'medium', sets: 4, reps: '3 min' },
  { name: 'T-Test Cone Drill',    category: 'speed', equipment: 'field', loads: ['knee','ankle'],      intensity: 'high',   sets: 3, reps: '5 reps' },
  { name: 'Flying 30s',           category: 'speed', equipment: 'field', loads: ['hamstring'],         intensity: 'high',   sets: 5, reps: 'Max effort' },
  { name: 'A-Skips',              category: 'speed', equipment: 'field', loads: [],                    intensity: 'low',    sets: 3, reps: '20m' },

  // SPEED — gym
  { name: 'Plyometric Box Jumps', category: 'speed', equipment: 'gym', loads: ['knee'],            intensity: 'high', sets: 4, reps: '8' },
  { name: 'Kettlebell Swings',    category: 'speed', equipment: 'gym', loads: ['back','hamstring'],intensity: 'high', sets: 4, reps: '15' },
  { name: 'Broad Jumps',          category: 'speed', equipment: 'gym', loads: ['knee'],            intensity: 'high', sets: 4, reps: '6' },

  // SPEED — bands
  { name: 'Resisted Sprints',         category: 'speed', equipment: 'bands', loads: ['hamstring'], intensity: 'high',   sets: 5, reps: '20m' },
  { name: 'Banded Lateral Shuffles',  category: 'speed', equipment: 'bands', loads: ['knee'],      intensity: 'medium', sets: 4, reps: '20m' },

  // SPEED — ball (with-ball acceleration & change of direction)
  { name: 'Sprint Dribble with Ball',         category: 'speed', equipment: 'ball', loads: ['hamstring','ankle'], intensity: 'high',   sets: 5, reps: '20m' },
  { name: 'Inside Cut - Outside Cut Drill',   category: 'speed', equipment: 'ball', loads: ['knee','ankle'],      intensity: 'medium', sets: 4, reps: '2 min' },

  // SPEED — bodyweight
  { name: 'High Knees',  category: 'speed', equipment: 'none', loads: ['ankle'],          intensity: 'medium', sets: 3, reps: '30s' },
  { name: 'Tuck Jumps',  category: 'speed', equipment: 'none', loads: ['knee','ankle'],   intensity: 'high',   sets: 3, reps: '10' },

  // SKILLS — ball, position-aware
  { name: 'Inside-Inside Touches - Alternating Feet', category: 'skills', equipment: 'ball',  loads: [], intensity: 'low',    sets: 5, reps: '3 min' },
  { name: 'Wall Passing: Left and Right Foot',        category: 'skills', equipment: 'ball',  loads: [], intensity: 'low',    sets: 4, reps: '20 passes each foot' },
  { name: 'Shooting to Target Cones',                  category: 'skills', equipment: 'ball',  loads: [], intensity: 'medium', sets: 3, reps: '15 shots',
    positions: ['midfielder','forward'] },
  { name: 'First Touch from Throw-Up',                 category: 'skills', equipment: 'ball',  loads: [], intensity: 'low',    sets: 4, reps: '10 min' },
  { name: 'Juggling with Both Feet',                   category: 'skills', equipment: 'ball',  loads: [], intensity: 'low',    sets: 5, reps: '3 min' },
  { name: 'Crossing Drills',              category: 'skills', equipment: 'ball',  loads: [], intensity: 'medium', sets: 3, reps: '20 crosses',
    positions: ['defender','midfielder'] },
  { name: 'Aerial Duels / Heading',       category: 'skills', equipment: 'ball',  loads: [], intensity: 'medium', sets: 4, reps: '15 reps',
    positions: ['defender','forward'] },
  { name: 'Goalkeeper Handling',          category: 'skills', equipment: 'ball',  loads: ['shoulder'], intensity: 'medium', sets: 5, reps: '3 min',
    positions: ['goalkeeper'] },
  { name: 'Diving Saves',                 category: 'skills', equipment: 'ball',  loads: ['shoulder'], intensity: 'high',   sets: 4, reps: '10 each side',
    positions: ['goalkeeper'] },
  { name: 'Distribution Practice',        category: 'skills', equipment: 'ball',  loads: ['shoulder'], intensity: 'medium', sets: 4, reps: '20 reps',
    positions: ['goalkeeper'] },
  { name: 'Dribbling Through Cone Pattern',  category: 'skills', equipment: 'field', loads: [],               intensity: 'medium', sets: 4, reps: '5 circuits' },
  { name: 'Figure-8 Dribbling Around Cones', category: 'skills', equipment: 'field', loads: [],               intensity: 'medium', sets: 4, reps: '8 patterns' },
  { name: 'Small-Sided Games',               category: 'skills', equipment: 'field', loads: ['knee','ankle'], intensity: 'high',   sets: 1, reps: '10 min' },
  { name: '1v1 Defending Drills',         category: 'skills', equipment: 'field', loads: ['knee'],     intensity: 'medium', sets: 4, reps: '5 reps',
    positions: ['defender'] },

  // CONDITIONING / weight-loss
  { name: 'HIIT Circuit',         category: 'conditioning', equipment: 'field', loads: [],           intensity: 'high',   sets: 4, reps: '45s on, 15s off' },
  { name: 'Burpees',              category: 'conditioning', equipment: 'field', loads: ['shoulder'], intensity: 'high',   sets: 3, reps: '15' },
  { name: 'Mountain Climbers',    category: 'conditioning', equipment: 'field', loads: ['shoulder'], intensity: 'medium', sets: 3, reps: '30s' },
  { name: 'Full-Body Circuit',    category: 'conditioning', equipment: 'gym',   loads: [],           intensity: 'high',   sets: 3, reps: '10 stations' },
  { name: 'Full Body Band Circuit', category: 'conditioning', equipment: 'bands', loads: [],         intensity: 'high',   sets: 3, reps: '30s each' },
  { name: 'Bodyweight Burpees',   category: 'conditioning', equipment: 'none',  loads: ['shoulder'], intensity: 'high',   sets: 3, reps: '12' },
  { name: 'Bodyweight Mountain Climbers', category: 'conditioning', equipment: 'none', loads: ['shoulder'], intensity: 'medium', sets: 3, reps: '30s' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Periodization — explicit phase counts so taper is never skipped on rounding.
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_PLAN: Record<WeeksAvailable, [number, number, number, number]> = {
  4:  [1, 1, 1, 1],
  6:  [1, 2, 2, 1],
  8:  [2, 2, 3, 1],
  10: [2, 3, 3, 2],
};

const PHASE_LABELS: Record<Phase, string> = {
  foundation: 'Foundation',
  build: 'Build',
  peak: 'Peak',
  taper: 'Taper',
};

const PHASE_INTENSITY: Record<Phase, 'low' | 'medium' | 'high'> = {
  foundation: 'low',
  build: 'medium',
  peak: 'high',
  taper: 'medium',
};

// Volume multipliers — taper drops volume but PHASE_INTENSITY keeps quality.
const PHASE_VOLUME_MULT: Record<Phase, number> = {
  foundation: 0.85,
  build: 1.0,
  peak: 1.1,
  taper: 0.7,
};

function phaseFor(week: number, totalWeeks: WeeksAvailable): Phase {
  const [f, b, p] = PHASE_PLAN[totalWeeks];
  if (week <= f) return 'foundation';
  if (week <= f + b) return 'build';
  if (week <= f + b + p) return 'peak';
  return 'taper';
}

// ─────────────────────────────────────────────────────────────────────────────
// Selection — structured filters replace the old name-regex injury logic.
// ─────────────────────────────────────────────────────────────────────────────

const INJURY_LOAD: Record<InjuryArea, BodyPart[]> = {
  none:  [],
  knee:  ['knee'],
  ankle: ['ankle'],
  back:  ['back'],
  other: [], // free-text injury — can't auto-filter, recommendations cover it
};

function isContraindicated(ex: ExerciseDef, injury: InjuryArea): boolean {
  const blocked = INJURY_LOAD[injury];
  if (blocked.length === 0) return false;
  return ex.loads.some((l) => blocked.includes(l));
}

function fitsPosition(ex: ExerciseDef, position?: FootballPosition): boolean {
  if (!ex.positions) return true;        // no restriction
  if (!position) return false;           // exercise is position-specific but user has none
  return ex.positions.includes(position);
}

function fitsEquipment(ex: ExerciseDef, available: Equipment[]): boolean {
  if (ex.equipment === 'none') return true;
  return available.includes(ex.equipment);
}

function primaryCategory(goal: PrimaryGoal): Category {
  switch (goal) {
    case 'endurance':    return 'endurance';
    case 'strength':     return 'strength';
    case 'speed':        return 'speed';
    case 'skills':       return 'skills';
    case 'weight-loss':  return 'conditioning';
  }
}

function poolFor(category: Category, data: OnboardingData): ExerciseDef[] {
  const filtered = LIBRARY.filter(
    (ex) =>
      ex.category === category &&
      fitsEquipment(ex, data.equipment) &&
      fitsPosition(ex, data.position) &&
      !isContraindicated(ex, data.injury)
  );
  // Position-specific exercises bubble to the top so rotation favors them.
  return filtered.sort((a, b) => Number(!!b.positions) - Number(!!a.positions));
}

/** Deterministic rotation: same inputs → same plan, but each week shifts the
 *  starting index so weeks don't repeat the same exercises. */
function pickRotated<T>(pool: T[], week: number, count: number): T[] {
  if (pool.length === 0) return [];
  const out: T[] = [];
  const start = ((week - 1) * count) % pool.length;
  for (let i = 0; i < count; i++) {
    out.push(pool[(start + i) % pool.length]);
  }
  return out;
}

function materialize(def: ExerciseDef, phase: Phase): Exercise {
  const mult = PHASE_VOLUME_MULT[phase];
  const sets = def.sets ? Math.max(1, Math.round(def.sets * mult)) : undefined;
  return {
    name: def.name,
    sets,
    reps: def.reps,
    duration: def.duration,
    rest: def.rest,
    equipment: def.equipment,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Weekly schedule — fixed daily focus per days-per-week, with position prefix.
// ─────────────────────────────────────────────────────────────────────────────

interface SessionPlan {
  title: string;
  focus: string;
  category: Category;
}

function categoryToSession(
  category: Category,
  position?: FootballPosition
): SessionPlan {
  const positionPrefix = position
    ? `${position[0].toUpperCase() + position.slice(1)} `
    : '';
  const titleByCategory: Record<Category, string> = {
    speed: 'Speed & Agility',
    strength: 'Strength',
    endurance: 'Endurance',
    skills: positionPrefix ? `${positionPrefix}Skills` : 'Technical Skills',
    conditioning: 'Conditioning',
  };
  const focus = titleByCategory[category];
  return { title: `${focus} Session`, focus, category };
}

function sessionPlanForDay(
  day: number,
  daysPerWeek: number,
  data: OnboardingData
): SessionPlan {
  const goalCat = primaryCategory(data.goal);
  const pos = data.position;

  if (daysPerWeek === 2) {
    if (day === 1) return categoryToSession(goalCat, pos);
    return categoryToSession(goalCat === 'endurance' ? 'strength' : 'endurance', pos);
  }
  if (daysPerWeek === 3) {
    if (day === 1) return categoryToSession('speed', pos);
    if (day === 2) return categoryToSession('strength', pos);
    return categoryToSession(goalCat, pos);
  }
  if (daysPerWeek === 4) {
    if (day === 1) return categoryToSession('speed', pos);
    if (day === 2) return categoryToSession('strength', pos);
    if (day === 3) return categoryToSession('endurance', pos);
    return categoryToSession('skills', pos);
  }
  // 5 days
  if (day === 1) return categoryToSession('speed', pos);
  if (day === 2) return categoryToSession('strength', pos);
  if (day === 3) return categoryToSession('endurance', pos);
  if (day === 4) return categoryToSession('skills', pos);
  return categoryToSession('conditioning', pos);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tips & recommendations — phase- and position-aware.
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_TIPS: Record<Phase, string[]> = {
  foundation: [
    'Focus on movement quality over intensity',
    "Build your aerobic base — don't skip the easy days",
    'Establish the habit; consistency beats peak effort right now',
  ],
  build: [
    'Volume goes up this phase — track sets and reps to stay honest',
    'Add weight or distance week-over-week, even slightly',
    'Add 10–15 min of mobility work after each session',
  ],
  peak: [
    'Highest intensity of the cycle — prioritize sleep and nutrition',
    'Quality reps over quantity; stop a set if form breaks',
    'Active recovery between hard sessions: walk, swim, mobility',
  ],
  taper: [
    'Cut volume but keep intensity to stay sharp',
    "Save your legs — you're prepping to peak when the season starts",
    'More sleep, more hydration, more mobility',
  ],
};

const POSITION_TIP: Partial<Record<FootballPosition, string>> = {
  goalkeeper: "Don't skip handling work even on conditioning days",
  defender: 'Aerial timing improves with deliberate practice — block 5 min for it',
  midfielder: 'Mid-week long run is non-negotiable for box-to-box stamina',
  forward: 'Finish every shooting drill at game pace, never lazy',
};

function tipsFor(phase: Phase, position?: FootballPosition): string[] {
  const out = [...PHASE_TIPS[phase]];
  if (position && POSITION_TIP[position]) out.push(POSITION_TIP[position] as string);
  return out;
}

function recommendationsFor(data: OnboardingData): string[] {
  const recs: string[] = [
    'Warm up 10 min before every session — dynamic stretches, not static',
    'Cool down with 5 min easy movement and 5 min stretching',
  ];

  if (data.fitnessLevel === 'beginner') {
    recs.push('Stick to the prescribed sets; only add weight/reps when form holds');
  }
  if (data.daysPerWeek >= 4) {
    recs.push('Avoid back-to-back high-intensity days — alternate hard with easy');
  }
  if (data.injury !== 'none') {
    recs.push('Exercises that load your injured area are auto-filtered out');
    recs.push('Stop any movement that causes sharp pain; see a physio if it persists');
  }

  // Position-specific
  if (data.position === 'goalkeeper') {
    recs.push('Reactive speed beats raw speed for keepers — train short bursts');
  } else if (data.position === 'defender') {
    recs.push('Build leg strength and core stability above all else');
  } else if (data.position === 'midfielder') {
    recs.push('Aerobic base is your edge — protect one long run per week');
  } else if (data.position === 'forward') {
    recs.push('Sprint quality over quantity — fewer reps, full recovery');
  }

  // Goal-specific
  if (data.goal === 'endurance') {
    recs.push('Mix steady runs with intervals — both energy systems matter');
  } else if (data.goal === 'strength') {
    recs.push('Progressive overload: add 2.5–5% weight when you hit top reps cleanly');
  } else if (data.goal === 'speed') {
    recs.push('Full recovery between sprints — sub-max sprints train endurance, not speed');
  } else if (data.goal === 'skills') {
    recs.push('Quality reps with the ball every day — even 15 min beats one long session');
  } else if (data.goal === 'weight-loss') {
    recs.push('Diet is the bigger lever — pair this plan with a 300–500 kcal deficit');
  }

  return recs;
}

function summaryFor(data: OnboardingData): string {
  const goalText = data.goal.replace('-', ' ');
  const positionText = data.position ? `${data.position}-focused ` : '';
  const equipText =
    data.equipment.length > 1
      ? `${data.equipment.length} equipment options`
      : data.equipment[0] ?? 'bodyweight only';
  return `${data.weeksAvailable}-week ${positionText}${goalText} program — ${data.daysPerWeek} sessions/week, ${equipText}, periodized in 4 phases (foundation → build → peak → taper) for ${data.fitnessLevel} athletes.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sizing helpers
// ─────────────────────────────────────────────────────────────────────────────

function exercisesPerSession(level: FitnessLevel, phase: Phase): number {
  const base = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5;
  return phase === 'taper' ? Math.max(2, base - 1) : base;
}

function baseDurationFor(level: FitnessLevel): number {
  return level === 'beginner' ? 35 : level === 'intermediate' ? 50 : 65;
}

function durationForPhase(base: number, phase: Phase): string {
  const min = Math.round(base * PHASE_VOLUME_MULT[phase]);
  return `${min}–${min + 10} min`;
}

const DEFAULT_BODYWEIGHT: ExerciseDef[] = [
  { name: 'Warm-up Jog',        category: 'endurance', equipment: 'none', loads: ['ankle'],          intensity: 'low',    sets: 1, reps: '5 min' },
  { name: 'Push-ups',           category: 'strength',  equipment: 'none', loads: ['shoulder'],       intensity: 'medium', sets: 3, reps: '10-15' },
  { name: 'Bodyweight Squats',  category: 'strength',  equipment: 'none', loads: ['knee'],           intensity: 'low',    sets: 3, reps: '15-20' },
  { name: 'Plank',              category: 'strength',  equipment: 'none', loads: ['back','shoulder'],intensity: 'low',    sets: 3, reps: '30s' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Top-level generator
// ─────────────────────────────────────────────────────────────────────────────

export function generateTrainingPlan(data: OnboardingData): TrainingPlan {
  const totalWeeks = data.weeksAvailable;
  const baseDuration = baseDurationFor(data.fitnessLevel);
  const weeks: WeeklyPlan[] = [];

  for (let week = 1; week <= totalWeeks; week++) {
    const phase = phaseFor(week, totalWeeks);
    const sessions: WorkoutSession[] = [];

    for (let day = 1; day <= data.daysPerWeek; day++) {
      const sessPlan = sessionPlanForDay(day, data.daysPerWeek, data);

      // Multi-level fallback so every session produces something usable, even
      // if the user has minimal equipment or a category yields zero matches.
      const direct = poolFor(sessPlan.category, data);
      const goalFallback = direct.length > 0 ? direct : poolFor(primaryCategory(data.goal), data);
      const noEquipFallback =
        goalFallback.length > 0
          ? goalFallback
          : LIBRARY.filter((ex) => ex.equipment === 'none' && !isContraindicated(ex, data.injury));
      const finalPool = noEquipFallback.length > 0 ? noEquipFallback : DEFAULT_BODYWEIGHT;

      const exerciseCount = exercisesPerSession(data.fitnessLevel, phase);
      const exercises = pickRotated(finalPool, week, exerciseCount).map((def) =>
        materialize(def, phase)
      );

      sessions.push({
        day,
        title: sessPlan.title,
        focus: sessPlan.focus,
        exercises,
        duration: durationForPhase(baseDuration, phase),
        intensity: PHASE_INTENSITY[phase],
      });
    }

    weeks.push({
      weekNumber: week,
      sessions,
      focus: PHASE_LABELS[phase],
      tips: tipsFor(phase, data.position),
    });
  }

  return {
    weeks,
    summary: summaryFor(data),
    recommendations: recommendationsFor(data),
  };
}
