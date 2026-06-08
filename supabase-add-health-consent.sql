-- ─────────────────────────────────────────────────────────────────────────────
-- Health-data consent record (GDPR/PIPEDA accountability)
--
-- The injury and fitness information collected during onboarding is health-
-- related (special category) data. The app captures explicit consent via a
-- required checkbox on the injuries step before a plan can be generated; this
-- column records WHEN that consent was given, so we can demonstrate it.
--
-- Written by saveUserPreferences at onboarding completion. Nullable: existing
-- rows (users who onboarded before this feature) stay null until they next
-- complete onboarding.
--
-- RLS already restricts user_preferences to the owning user, so no new policy
-- is needed. Run once in the Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.user_preferences
  add column if not exists health_consent_at timestamptz;
