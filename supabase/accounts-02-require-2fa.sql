-- Shared boxofjelly.xyz accounts, step 2 of 2: require 2FA for data.
-- Adds a RESTRICTIVE policy to every per-user table (and foods): a row
-- is only reachable from a session that passed the authenticator-app
-- check (JWT "aal" = aal2). Restrictive policies are ANDed with the
-- existing owner policies, so those keep working unchanged on top.
--
-- RUN THIS ONLY AFTER you've set up 2FA on accounts.boxofjelly.xyz and
-- signed in with it — before that, your data would be unreachable.
-- To undo: drop policy "require 2fa" on <table>; for each table below.

do $$
declare t text;
begin
  foreach t in array array[
    'profile', 'weight_logs', 'macro_goals', 'logs', 'recipes', 'recipe_ingredients',
    'supplements', 'supplement_logs', 'meal_preps', 'meal_prep_ingredients', 'foods',
    'usernames', 'finance_kv'
  ] loop
    execute format('drop policy if exists "require 2fa" on public.%I', t);
    execute format(
      'create policy "require 2fa" on public.%I as restrictive for all to authenticated
         using ((select auth.jwt() ->> ''aal'') = ''aal2'')
         with check ((select auth.jwt() ->> ''aal'') = ''aal2'')', t);
  end loop;
end $$;
