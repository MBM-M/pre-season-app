# Pre-Season Trainer

A full-stack web app that builds a periodized pre-season training plan personalized to a footballer's position, fitness level, equipment, injuries, and timeline. Free users get a deterministic template-based plan; premium users get an AI-generated plan from a server-side Claude integration.

Built as a portfolio project to demonstrate modern full-stack engineering — TypeScript/React frontend, authenticated Postgres backend, serverless edge functions, and a real-world LLM integration with structured output validation.

## Highlights

- **Personalized plan generation.** An 8-step onboarding captures position, fitness level, weekly availability, equipment, injuries, and goal. The output is a periodized multi-week plan with phased intensity (Foundation, Build, Peak, Taper) and varied exercises that rotate across weeks.
- **Structured injury handling.** Exercises are tagged with the body parts they load (knee, ankle, back, shoulder, hamstring); a declared injury filters those out instead of pattern-matching exercise names.
- **Position-aware sessions.** Position-specific drills (goalkeeper handling, defender 1v1s, midfielder/forward shooting, defender/forward aerial duels) bubble to the top of each session pool when the user has a position selected.
- **Two plan engines, one schema.** The free deterministic generator and the premium Claude-powered generator both produce the same `TrainingPlan` shape, so the UI doesn't care which produced the plan.
- **LLM applied to a real-world use case.** The premium tier calls the Anthropic API server-side via a Supabase Edge Function, with a typed JSON contract and validation so the model's output is safe to render directly.
- **Modern auth + DB.** Clerk for sign-in/sign-up, Supabase Postgres for persistence, with a normalized schema (users / preferences / training plans) and a snake_case-to-camelCase mapping layer between SQL rows and React state.

## Tech stack

**Frontend** — React 19, TypeScript, Vite, Tailwind CSS 3, framer-motion
**Backend** — Supabase (Postgres + Edge Functions / Deno)
**Auth** — Clerk (React SDK)
**AI** — Anthropic Claude API (server-side via Edge Function)
**Tooling** — ESLint (typescript-eslint, react-hooks, react-refresh), Vite HMR

## Architecture at a glance

```
┌────────────────┐         ┌─────────────────────────┐
│ React UI       │◄───────►│ Supabase Postgres       │
│ (Vite, Clerk)  │  REST   │  users / preferences /  │
│                │         │  training_plans         │
└──────┬─────────┘         └─────────────────────────┘
       │
       │   1) Free tier: deterministic generator (in-browser, planGenerator.ts)
       │
       │   2) Premium tier: serverless function call
       ▼
┌────────────────────────────┐         ┌────────────────────┐
│ Supabase Edge Function     │────────►│ Anthropic API      │
│ generate-premium-plan      │  HTTPS  │ Claude (Sonnet)    │
│ (Deno, server-side key)    │◄────────│                    │
└────────────────────────────┘         └────────────────────┘
```

The free generator (`src/lib/planGenerator.ts`) builds plans from a tagged exercise library with deterministic rotation and a structured contraindication filter — same inputs always produce the same plan. The premium generator (`src/lib/aiPlanGenerator.ts` + `supabase/functions/generate-premium-plan/index.ts`) wraps the same shape around an LLM call so the UI stays unified.

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A Supabase project (free tier is fine)
- A Clerk application (free tier is fine)

### 1. Clone and install

```bash
git clone https://github.com/MBM-M/pre-season-app.git
cd pre-season-app
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Initialize the Supabase schema

In the Supabase dashboard → SQL Editor, run the contents of `supabase-schema.sql`. For local development, `supabase-disable-rls.sql` turns off row-level security (do not use in production).

### 4. Run the dev server

```bash
npm run dev
```

The app is served at `http://localhost:5173` with hot module reload.

```bash
npm run build      # production bundle
npm run lint       # lint
npm run preview    # serve the production bundle locally
```

## Optional: enable the premium AI tier

The premium tier is gated behind a localStorage flag for now (Settings → Developer → Premium dev access). To make it actually call Claude, deploy the edge function and set the API key as a server-side secret.

### Via the Supabase dashboard (no CLI required)

1. Anthropic Console → create an API key (https://console.anthropic.com/settings/keys). Make sure billing is set up — the Anthropic API has no free tier.
2. Supabase dashboard → Edge Functions → Create a new function → name it `generate-premium-plan`. Paste the contents of `supabase/functions/generate-premium-plan/index.ts` into the editor and deploy.
3. Project Settings → Edge Functions → Secrets → add `ANTHROPIC_API_KEY` with your key. (Optionally `ANTHROPIC_MODEL` to override the default `claude-sonnet-4-5`.)
4. In the running app: Settings → Developer → toggle Premium dev access on. Dashboard → Generate AI Plan.

### Via the Supabase CLI

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy generate-premium-plan
```

## Project layout

```
src/
  components/
    onboarding/        Multi-step onboarding flow
    dashboard/         Dashboard + training plan renderer
    settings/          Edit-profile / re-onboarding screen
    layout/            Persistent header
    ui/                Buttons, toasts, primitives
  lib/
    planGenerator.ts   Deterministic free-tier plan engine
    aiPlanGenerator.ts Frontend wrapper for the premium edge function
    premium.ts         Premium tier flag (localStorage today, Stripe later)
    database.ts        Supabase queries with snake_case ↔ camelCase mapping
    improvementProjection.ts  Projection model for the pre-signup vision screen
  types/
    onboarding.ts      Shared OnboardingData type and option lists
supabase/
  functions/
    generate-premium-plan/   Deno edge function calling the Anthropic API
```

## Roadmap

- Workout completion tracking and weekly check-ins
- Stripe checkout for the premium tier (replaces the dev toggle)
- Re-enable Supabase row-level security with a Clerk JWT integration
- Mobile-responsive audit and PWA install
- Per-position drill libraries with video links

## License

MIT — see [LICENSE](./LICENSE).
