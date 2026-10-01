-- Finance sync: conflict-safe saves.
-- finance_kv_put saves a batch of keys, but only where the server still has
-- the version the device last saw ("expected" = that row's updated_at, or
-- null for a key the device has never synced). Anything changed meanwhile
-- by another device comes back as a conflict, so the device merges first
-- and retries instead of overwriting the other device's changes.
-- Additive: changes nothing that already exists.

create or replace function public.finance_kv_put(rows jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  r jsonb;
  cur timestamptz;
  new_ts timestamptz;
  uid uuid := auth.uid();
  applied jsonb := '[]'::jsonb;
  conflicts jsonb := '[]'::jsonb;
begin
  if uid is null then raise exception 'not signed in'; end if;
  for r in select * from jsonb_array_elements(rows) loop
    select updated_at into cur from public.finance_kv where user_id = uid and key = r ->> 'key' for update;
    if (cur is null and r ->> 'expected' is null)
       or (cur is not null and r ->> 'expected' is not null and cur = (r ->> 'expected')::timestamptz) then
      insert into public.finance_kv (user_id, key, value) values (uid, r ->> 'key', r -> 'value')
        on conflict (user_id, key) do update set value = excluded.value
        returning updated_at into new_ts;
      applied := applied || jsonb_build_object('key', r ->> 'key', 'updated_at', new_ts);
    else
      conflicts := conflicts || jsonb_build_object('key', r ->> 'key', 'updated_at', cur);
    end if;
  end loop;
  return jsonb_build_object('applied', applied, 'conflicts', conflicts);
end $$;

revoke all on function public.finance_kv_put(jsonb) from public, anon;
grant execute on function public.finance_kv_put(jsonb) to authenticated;
