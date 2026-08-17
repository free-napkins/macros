-- Weight/goal tracking schema. Run in the Supabase SQL editor
-- (adds to the tables created by supabase/schema.sql).

-- Onboarding inputs used to compute macro goals. Single row expected;
-- the app always reads the most recently created one.
create table profile (
  id uuid primary key default gen_random_uuid(),
  sex text not null check (sex in ('male', 'female')),
  birth_date date not null,
  height_cm numeric not null,
  activity_level text not null check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal_type text not null check (goal_type in ('lose', 'maintain', 'gain')),
  rate_kg_per_week numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per day.
create table weight_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  weight_kg numeric not null,
  logged_at timestamptz not null default now()
);

-- Append-only: each row is a goal that took effect on effective_date.
-- The "current" goal is the most recent row by effective_date. Never
-- update rows in place — insert a new one so the history (and the
-- reason for each change) is preserved for the calendar/analysis.
--
-- Named macro_goals (not "goals") because a "goals" table already
-- exists in this project, left over from the original auto-generated
-- dashboard — it has an unrelated "type" column and isn't ours.
create table macro_goals (
  id uuid primary key default gen_random_uuid(),
  effective_date date not null,
  calories numeric not null,
  protein_g numeric not null,
  carbs_g numeric not null,
  fat_g numeric not null,
  reason text not null default 'onboarding',
  created_at timestamptz not null default now()
);
create index macro_goals_effective_date_idx on macro_goals (effective_date desc);

alter table profile enable row level security;
alter table weight_logs enable row level security;
alter table macro_goals enable row level security;

create policy "allow all" on profile for all using (true) with check (true);
create policy "allow all" on weight_logs for all using (true) with check (true);
create policy "allow all" on macro_goals for all using (true) with check (true);
