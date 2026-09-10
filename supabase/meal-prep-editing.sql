-- Preserve meal-prep ingredients so active batches can be edited later.
create table if not exists meal_prep_ingredients (
  id uuid primary key default gen_random_uuid(),
  meal_prep_id uuid not null references meal_preps(id) on delete cascade,
  food_id uuid not null references foods(id) on delete restrict,
  grams numeric not null
);

alter table meal_prep_ingredients enable row level security;
create policy "owner access" on meal_prep_ingredients for all
  using (exists (select 1 from meal_preps where meal_preps.id = meal_prep_ingredients.meal_prep_id and meal_preps.user_id = auth.uid()))
  with check (exists (select 1 from meal_preps where meal_preps.id = meal_prep_ingredients.meal_prep_id and meal_preps.user_id = auth.uid()));