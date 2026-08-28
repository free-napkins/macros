-- Optional product grouping so multiple sizes/flavors of the same
-- product (Kit Kat Individual/King Size, Oreo Single/Double Stuff)
-- search as one product with a variant picker, instead of unrelated
-- duplicate rows. Fully additive/nullable — every existing row has
-- product_name/variant_label = null and continues to search and
-- behave exactly as a single, ungrouped result, same as today.
--
-- Run in the Supabase SQL editor (any time; independent of the auth
-- migrations, though logically fine to run after auth-02).

alter table foods add column if not exists product_name text;
alter table foods add column if not exists variant_label text;
create index if not exists foods_product_name_idx on foods (lower(product_name));
