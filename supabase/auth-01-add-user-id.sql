-- Phase 1 of adding real accounts: nullable user_id columns on every
-- table that holds personal (per-account) data. foods stays global/
-- shared (no user_id) so a scanned product benefits every account.
-- recipe_ingredients stays keyed via recipe_id -> recipes.user_id, no
-- direct column needed. Policies are UNCHANGED here (still "allow
-- all") so the app keeps working exactly as today until you've signed
-- up through the new Auth screen and are ready to run auth-02.
--
-- Run in the Supabase SQL editor.

alter table profile          add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table weight_logs      add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table macro_goals      add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table logs             add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table recipes          add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table supplements      add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table supplement_logs  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists profile_user_id_idx        on profile (user_id);
create index if not exists weight_logs_user_id_idx     on weight_logs (user_id);
create index if not exists macro_goals_user_id_idx     on macro_goals (user_id);
create index if not exists logs_user_id_date_idx       on logs (user_id, date);
create index if not exists recipes_user_id_idx         on recipes (user_id);
create index if not exists supplements_user_id_idx     on supplements (user_id);
create index if not exists supplement_logs_user_id_idx on supplement_logs (user_id);
