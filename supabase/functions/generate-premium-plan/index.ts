// Supabase Edge Function: generate-premium-plan
//
// Calls the Anthropic API to produce a personalized training plan that
// matches the same TrainingPlan shape the frontend already renders.
//
// Deployment (one-time setup, run from the project root in PowerShell):
//   1. Install the Supabase CLI:           winget install Supabase.CLI
//   2. Log in:                             supabase login
//   3. Link this project:                  supabase link --project-ref <your-project-ref>
//   4. Set the API key as a secret:        supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//      (Optional override the model:       supabase secrets set ANTHROPIC_MODEL=claude-sonnet-4-5)
//   5. Deploy this function:               supabase functions deploy generate-premium-plan
//
// After deployment the frontend calls this via supabase.functions.invoke().

// deno-lint-ignore-file no-explicit-any
// @ts-ignore — Deno-only import resolved by the edge runtime
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-4-5';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  if (!ANTHROPIC_API_KEY) {
    return json(
      { error: 'ANTHROPIC_API_KEY is not set on the function. Run `supabase secrets set ANTHROPIC_API_KEY=...`' },
      500
    );
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const data = payload?.onboardingData;
  if (!data || typeof data !== 'object') {
    return json({ error: 'Missing onboardingData' }, 400);
  }

  try {
    const plan = await generatePlan(data);
    return json({ plan });
  } catch (e) {
    console.error('generate-premium-plan error', e);
    return json({ error: (e as Error).message ?? 'internal error' }, 500);
  }
});

const SYSTEM_PROMPT = `You are an elite football (soccer) pre-season strength & conditioning coach.
Your job: build a periodized training plan tailored to the athlete's profile.

HARD RULES
- Use ONLY exercises that match the athlete's available equipment list.
- Respect the declared injury — never prescribe exercises that load the injured joint or area.
- For position-specific drills (goalkeeper / defender / midfielder / forward), tailor session content accordingly.
- Periodize across 4 phases — Foundation → Build → Peak → Taper — sized to the total weeks (taper is always at least 1 week).
- Each session must contain 3 to 5 exercises plus a clear focus and one of: low / medium / high intensity.
- Be specific: real exercise names with concrete sets, reps, and rest. No motivational fluff.

OUTPUT FORMAT
Return a single JSON object — no markdown, no prose, no code fences — matching exactly:
{
  "summary": string,
  "weeks": [
    {
      "weekNumber": number,
      "focus": string,
      "tips": string[],
      "sessions": [
        {
          "day": number,
          "title": string,
          "focus": string,
          "duration": string,
          "intensity": "low" | "medium" | "high",
          "exercises": [
            { "name": string, "sets": number, "reps": string, "equipment": string, "rest": string }
          ]
        }
      ]
    }
  ],
  "recommendations": string[]
}

Notes:
- "rest" is optional on each exercise; omit if it doesn't apply (e.g. continuous run).
- "duration" on a session is a string range like "45-60 min".
- "tips" should be 2-4 short, concrete pieces of coaching for that specific week.
- "recommendations" are 4-8 plan-level items the athlete should follow throughout.`;

interface OnboardingDataIn {
  region?: string;
  position?: string;
  fitnessLevel?: string;
  weeksAvailable?: number;
  daysPerWeek?: number;
  equipment?: string[];
  injury?: string;
  injuryDetails?: string;
  goal?: string;
  seasonStartDate?: string;
}

function buildUserPrompt(data: OnboardingDataIn): string {
  const equipment = (data.equipment ?? []).join(', ') || 'bodyweight only';
  const injuryLine =
    data.injury && data.injury !== 'none'
      ? `${data.injury}${data.injuryDetails ? ` (${data.injuryDetails})` : ''}`
      : 'none';
  return `Generate a ${data.weeksAvailable ?? 6}-week football pre-season plan for this athlete:

Position:           ${data.position ?? 'unspecified'}
Fitness level:      ${data.fitnessLevel ?? 'intermediate'}
Sessions per week:  ${data.daysPerWeek ?? 3}
Available equipment: ${equipment}
Injury:             ${injuryLine}
Primary goal:       ${(data.goal ?? 'endurance').replace('-', ' ')}
Region:             ${data.region ?? 'other'}

Return only the JSON object — no preamble, no explanation, no code fences.`;
}

async function generatePlan(data: OnboardingDataIn) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      // Up to 64K on Sonnet 4.5 — 16K covers the worst case (10 weeks × 5 sessions
      // × 5 exercises with tips + recommendations) with comfortable headroom.
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(data) }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const body = await res.json();
  const text: string | undefined = body?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Claude');

  // Strip any defensive code fences if Claude wraps the JSON.
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let plan: any;
  try {
    plan = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(
      `Could not parse Claude response as JSON: ${(e as Error).message}. First 500 chars: ${cleaned.slice(0, 500)}`
    );
  }

  // Lightweight shape validation so a malformed response doesn't reach the UI.
  if (!Array.isArray(plan?.weeks)) throw new Error('Plan is missing weeks[]');
  if (typeof plan.summary !== 'string') throw new Error('Plan is missing summary');
  if (!Array.isArray(plan?.recommendations)) plan.recommendations = [];

  return plan;
}
