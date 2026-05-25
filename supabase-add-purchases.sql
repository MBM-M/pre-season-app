-- ─────────────────────────────────────────────────────────────────────────────
-- Premium tier: one-off "season pass", priced by season length
--
-- Model: a completed Stripe Checkout grants a pass that unlocks UNLIMITED AI
-- plan generations for the length of the season (an 8-week season = 8 weeks of
-- access, set as expires_at = paid time + weeks*7 days). Longer seasons cost
-- more. When the pass expires, a new purchase is needed.
--
-- AI generation can't be triggered without an active pass: the generate Edge
-- Function only runs if it receives a token from claim_ai_generation(), which
-- only hands one out while the caller has a paid, unexpired pass.
--
-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query).
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;  -- gen_random_uuid()

create table if not exists public.purchases (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users(id) on delete cascade,
  stripe_session_id     text unique not null,
  stripe_payment_intent text,
  currency              text not null,
  amount                integer not null,                 -- minor units (cents / pence)
  weeks                 integer not null,                 -- season length this pass covers
  status                text not null default 'pending',  -- 'pending' | 'paid'
  expires_at            timestamptz,                       -- set by webhook when paid
  generation_token      uuid unique,                       -- capability handed to the generate fn
  created_at            timestamptz not null default now()
);

create index if not exists purchases_user_id_idx on public.purchases (user_id);
create index if not exists purchases_token_idx   on public.purchases (generation_token);

alter table public.purchases enable row level security;

-- Owners may READ their own purchases. No insert/update/delete policies for end
-- users: only the service role (checkout + webhook) and the SECURITY DEFINER
-- functions below ever mutate this table.
drop policy if exists purchases_select_own on public.purchases;
create policy purchases_select_own on public.purchases
  for select
  using (user_id = public.current_user_id());

-- ── Claim a generation token ────────────────────────────────────────────────
-- Returns a capability token bound to the caller's active pass (the one that
-- expires latest). Mints a token the first time and REUSES it afterwards — the
-- pass allows unlimited generations while it's valid, so the token stays good
-- until the pass expires. SECURITY DEFINER so it can write past RLS, but scoped
-- to current_user_id().
create or replace function public.claim_ai_generation()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid;
  v_id    uuid;
  v_token uuid;
begin
  v_uid := public.current_user_id();
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select id, generation_token into v_id, v_token
  from public.purchases
  where user_id = v_uid
    and status = 'paid'
    and expires_at > now()
  order by expires_at desc
  for update skip locked
  limit 1;

  if v_id is null then
    raise exception 'no_active_pass';
  end if;

  if v_token is null then
    v_token := gen_random_uuid();
    update public.purchases
    set generation_token = v_token
    where id = v_id;
  end if;

  return v_token;
end;
$$;

grant execute on function public.claim_ai_generation() to authenticated, anon;

-- ── Active pass expiry (read-only, for UI button state) ──────────────────────
-- Returns the latest expiry of any active paid pass, or null if there is none.
create or replace function public.active_ai_pass_expiry()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  select max(expires_at)
  from public.purchases
  where user_id = public.current_user_id()
    and status = 'paid'
    and expires_at > now();
$$;

grant execute on function public.active_ai_pass_expiry() to authenticated, anon;
