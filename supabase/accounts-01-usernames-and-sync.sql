-- Shared boxofjelly.xyz accounts, step 1 of 2.
-- Adds usernames, the server-side helpers the accounts site uses for
-- username sign-in + rate limiting, and the finance app's sync table.
-- Safe to run while the apps are live: nothing here changes access to
-- existing tables. Step 2 (accounts-02-require-2fa.sql) turns on the
-- 2FA requirement and should only run after your 2FA is set up.
--
-- Run in the Supabase SQL editor (or: supabase db query --linked -f <file>).

-- ---------------------------------------------------------------
-- Usernames: one per account, unique ignoring case.
-- ---------------------------------------------------------------
create table if not exists public.usernames (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  username   text not null check (username ~ '^[A-Za-z0-9_]{3,24}$'),
  updated_at timestamptz not null default now()
);
create unique index if not exists usernames_lower_idx on public.usernames (lower(username));
alter table public.usernames enable row level security;

drop policy if exists "own username: read" on public.usernames;
drop policy if exists "own username: insert" on public.usernames;
drop policy if exists "own username: update" on public.usernames;
create policy "own username: read"   on public.usernames for select to authenticated using ((select auth.uid()) = user_id);
create policy "own username: insert" on public.usernames for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own username: update" on public.usernames for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Sign-up passes the chosen username as user metadata; this files it.
-- A taken username makes the unique index reject the sign-up.
create or replace function public.handle_new_user_username()
returns trigger language plpgsql security definer set search_path = '' as $$
declare wanted text := new.raw_user_meta_data ->> 'username';
begin
  if wanted is not null and wanted ~ '^[A-Za-z0-9_]{3,24}$' then
    insert into public.usernames (user_id, username) values (new.id, wanted);
  end if;
  return new;
end $$;
drop trigger if exists on_auth_user_created_username on auth.users;
create trigger on_auth_user_created_username
  after insert on auth.users for each row execute function public.handle_new_user_username();

-- "Is this username free?" for the sign-up form. Reveals nothing else.
create or replace function public.username_available(name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select name ~ '^[A-Za-z0-9_]{3,24}$'
     and not exists (select 1 from public.usernames u where lower(u.username) = lower(name));
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- ---------------------------------------------------------------
-- Sign-in helpers for the accounts site's server (service role only).
-- ---------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.login_attempts (
  id         bigserial primary key,
  bucket     text not null,          -- 'ip:<sha256>' or 'id:<sha256>'
  created_at timestamptz not null default now()
);
create index if not exists login_attempts_bucket_idx on private.login_attempts (bucket, created_at);

-- Username or email -> email for the password check. Server only.
create or replace function public.auth_login_email(identifier text)
returns text language sql stable security definer set search_path = '' as $$
  select case
    when position('@' in identifier) > 0 then lower(trim(identifier))
    else (select lower(au.email) from public.usernames u join auth.users au on au.id = u.user_id
          where lower(u.username) = lower(trim(identifier)) limit 1)
  end;
$$;

-- Allow at most 8 failed sign-ins per account and 30 per IP in 15 minutes.
create or replace function public.auth_login_allowed(ip_bucket text, id_bucket text)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select count(*) from private.login_attempts where bucket = ip_bucket and created_at > now() - interval '15 minutes') < 30
     and (select count(*) from private.login_attempts where bucket = id_bucket and created_at > now() - interval '15 minutes') < 8;
$$;

create or replace function public.auth_login_record(ip_bucket text, id_bucket text, succeeded boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if succeeded then
    delete from private.login_attempts where bucket = id_bucket;
  else
    insert into private.login_attempts (bucket) values (ip_bucket), (id_bucket);
  end if;
  delete from private.login_attempts where created_at < now() - interval '1 day';
end $$;

revoke all on function public.auth_login_email(text) from public, anon, authenticated;
revoke all on function public.auth_login_allowed(text, text) from public, anon, authenticated;
revoke all on function public.auth_login_record(text, text, boolean) from public, anon, authenticated;
grant execute on function public.auth_login_email(text) to service_role;
grant execute on function public.auth_login_allowed(text, text) to service_role;
grant execute on function public.auth_login_record(text, text, boolean) to service_role;

-- ---------------------------------------------------------------
-- Finance app sync: one row per stored key, so devices merge by key
-- and get each other's changes live (Realtime).
-- ---------------------------------------------------------------
create table if not exists public.finance_kv (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key        text not null check (char_length(key) between 1 and 200),
  value      jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key),
  check (pg_column_size(value) < 5000000)
);
alter table public.finance_kv enable row level security;
drop policy if exists "own finance data" on public.finance_kv;
create policy "own finance data" on public.finance_kv for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- The server's clock decides which device's change is newest.
create or replace function public.finance_kv_touch()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists finance_kv_touch on public.finance_kv;
create trigger finance_kv_touch before insert or update on public.finance_kv
  for each row execute function public.finance_kv_touch();

do $$ begin
  alter publication supabase_realtime add table public.finance_kv;
exception when duplicate_object then null;
end $$;
