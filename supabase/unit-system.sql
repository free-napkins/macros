-- Combined migration for this round of features:
-- 1. Persisted unit-system preference (metric/imperial).
-- 2. Serving-size metadata on foods, so a scanned label's natural
--    serving ("1 cup (240g)") can be logged directly instead of
--    always requiring a manual gram entry.

alter table profile add column if not exists unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial'));

alter table foods add column if not exists serving_size_g numeric;
alter table foods add column if not exists serving_label text;
