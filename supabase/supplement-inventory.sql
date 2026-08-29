-- Supplement inventory tracking: remaining doses, servings per
-- container, and how often it's taken (for a run-out projection).
-- All nullable/defaulted — existing supplements keep working exactly
-- as today; the countdown UI only appears once these are set.
--
-- Run in the Supabase SQL editor, or apply via
-- mcp__supabase__apply_migration.

alter table supplements add column if not exists servings_per_container numeric;
alter table supplements add column if not exists remaining_servings numeric;
alter table supplements add column if not exists doses_per_day numeric not null default 1;
