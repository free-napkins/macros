-- Meal Prep + Ask modes. Additive/backward-compatible: is_permanent
-- defaults to true, so every existing foods row keeps behaving
-- exactly as it does today (search-visible, same source values).
--
-- Run in the Supabase SQL editor, or apply via
-- mcp__supabase__apply_migration against the project.

-- 1. Widen foods.source. Check constraints can't be altered in place.
alter table foods drop constraint foods_source_check;
alter table foods add constraint foods_source_check
  check (source in ('ingredient', 'label', 'meal_prep', 'ask'));

-- 2. Reusability flag. Meal-prep batch foods and one-off ask-logged
-- foods are inserted with this false so they never surface in
-- FoodSearchInput's generic ingredient search.
alter table foods add column if not exists is_permanent boolean not null default true;

-- 3. Active meal-prep batches. Deleted once remaining_servings hits 0
-- — the underlying foods row and every logs row referencing it are
-- untouched; only this tracking row disappears.
create table meal_preps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid not null references foods(id) on delete cascade,
  name text not null,
  date_made date not null default current_date,
  serving_grams numeric not null,
  total_servings numeric not null,
  remaining_servings numeric not null,
  created_at timestamptz not null default now()
);

alter table meal_preps enable row level security;
create policy "owner access" on meal_preps for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
