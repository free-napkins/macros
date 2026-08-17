-- Macro tracker schema. Run in the Supabase SQL editor.

create extension if not exists pgcrypto;

-- Reusable food items: weighed whole ingredients or store-bought products
-- captured from a nutrition label photo. Values are per 100g.
create table foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source text not null check (source in ('ingredient', 'label')),
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  fiber_g numeric default 0,
  sugar_g numeric default 0,
  sodium_mg numeric default 0,
  micronutrients jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- A recipe combining multiple foods by weight.
create table recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  total_grams numeric not null,
  created_at timestamptz not null default now()
);

create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  food_id uuid not null references foods(id) on delete restrict,
  grams numeric not null
);

-- Supplements captured from a label photo. Values are per dose (not per 100g).
create table supplements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  dose_label text,
  nutrients jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table supplement_logs (
  id uuid primary key default gen_random_uuid(),
  supplement_id uuid not null references supplements(id) on delete cascade,
  date date not null default current_date,
  taken boolean not null default false,
  taken_at timestamptz,
  unique (supplement_id, date)
);

-- Food diary: each entry logs a weighed amount of a food OR a recipe.
create table logs (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  food_id uuid references foods(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete cascade,
  grams numeric not null,
  logged_at timestamptz not null default now(),
  constraint logs_one_source check (
    (food_id is not null and recipe_id is null) or
    (food_id is null and recipe_id is not null)
  )
);

-- Single-user app: permissive RLS so the anon key can read/write freely.
alter table foods enable row level security;
alter table recipes enable row level security;
alter table recipe_ingredients enable row level security;
alter table supplements enable row level security;
alter table supplement_logs enable row level security;
alter table logs enable row level security;

create policy "allow all" on foods for all using (true) with check (true);
create policy "allow all" on recipes for all using (true) with check (true);
create policy "allow all" on recipe_ingredients for all using (true) with check (true);
create policy "allow all" on supplements for all using (true) with check (true);
create policy "allow all" on supplement_logs for all using (true) with check (true);
create policy "allow all" on logs for all using (true) with check (true);
