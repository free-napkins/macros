-- Phase 2: run this ONCE, after you have signed up through the app's
-- new Auth screen (so exactly one auth.users row exists for you) and
-- confirmed you can log in. This is the step that changes access
-- control, so don't run it until phase 1 (auth-01-add-user-id.sql) is
-- applied and you've verified the app still works against it.
--
-- Step 1: find your new user id — either run:
--   select id, email from auth.users order by created_at desc limit 1;
-- or, from the browser console on the running app:
--   (await supabase.auth.getUser()).data.user.id
--
-- Step 2: replace every 'REPLACE_WITH_YOUR_USER_ID' below with that id
-- and run this whole file in the SQL editor.

-- 1. Backfill: every existing row belongs to the one real user.
update profile         set user_id = 'REPLACE_WITH_YOUR_USER_ID' where user_id is null;
update weight_logs     set user_id = 'REPLACE_WITH_YOUR_USER_ID' where user_id is null;
update macro_goals     set user_id = 'REPLACE_WITH_YOUR_USER_ID' where user_id is null;
update logs            set user_id = 'REPLACE_WITH_YOUR_USER_ID' where user_id is null;
update recipes         set user_id = 'REPLACE_WITH_YOUR_USER_ID' where user_id is null;
update supplements     set user_id = 'REPLACE_WITH_YOUR_USER_ID' where user_id is null;
update supplement_logs set user_id = 'REPLACE_WITH_YOUR_USER_ID' where user_id is null;

-- 2. Tighten: user_id becomes mandatory going forward.
alter table profile         alter column user_id set not null;
alter table weight_logs     alter column user_id set not null;
alter table macro_goals     alter column user_id set not null;
alter table logs            alter column user_id set not null;
alter table recipes         alter column user_id set not null;
alter table supplements     alter column user_id set not null;
alter table supplement_logs alter column user_id set not null;

-- 3. weight_logs: one entry per user per day, not one per day globally.
alter table weight_logs drop constraint if exists weight_logs_date_key;
alter table weight_logs add constraint weight_logs_user_date_key unique (user_id, date);

-- 4. Replace every "allow all" policy with real per-owner policies.
drop policy if exists "allow all" on profile;
drop policy if exists "allow all" on weight_logs;
drop policy if exists "allow all" on macro_goals;
drop policy if exists "allow all" on logs;
drop policy if exists "allow all" on recipes;
drop policy if exists "allow all" on recipe_ingredients;
drop policy if exists "allow all" on supplements;
drop policy if exists "allow all" on supplement_logs;
drop policy if exists "allow all" on foods;

create policy "owner access" on profile         for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner access" on weight_logs     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner access" on macro_goals     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner access" on logs            for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner access" on recipes         for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner access" on supplements     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner access" on supplement_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- recipe_ingredients has no user_id; ownership flows through its parent recipe.
create policy "owner via recipe" on recipe_ingredients for all
  using (exists (select 1 from recipes r where r.id = recipe_ingredients.recipe_id and r.user_id = auth.uid()))
  with check (exists (select 1 from recipes r where r.id = recipe_ingredients.recipe_id and r.user_id = auth.uid()));

-- foods: shared global catalog. Any signed-in user can read and add
-- to it; anon (no session) can no longer read or write, closing off
-- the previous unauthenticated access to /api/parse-label's output.
create policy "authenticated read" on foods for select using (auth.role() = 'authenticated');
create policy "authenticated write" on foods for insert with check (auth.role() = 'authenticated');
create policy "authenticated update" on foods for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
