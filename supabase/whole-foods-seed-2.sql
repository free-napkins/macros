-- Second whole-foods batch (137 more foods, tripling the original
-- 60 to 197 total): expanded meats/fish/dairy varieties, more
-- vegetables/fruits, more grains/legumes/nuts, plus new categories
-- (oils, herbs/spices, condiments, beverages). Same sourcing
-- approach as the first batch. Safe to re-run.

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Chicken drumstick, raw, skinless', 'ingredient', 172, 24, 0, 8, 0, 0, 95, '{"vitamin_b3_mg":5.3,"vitamin_b6_mg":0.3,"vitamin_b12_mcg":0.3,"iron_mg":1.2,"phosphorus_mg":173,"selenium_mcg":20,"zinc_mg":2.2}'::jsonb
where not exists (select 1 from foods where name = 'Chicken drumstick, raw, skinless' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Ground turkey, 93% lean, raw', 'ingredient', 150, 20, 0, 8, 0, 0, 75, '{"vitamin_b3_mg":5,"vitamin_b6_mg":0.4,"vitamin_b12_mcg":0.3,"selenium_mcg":23,"zinc_mg":2}'::jsonb
where not exists (select 1 from foods where name = 'Ground turkey, 93% lean, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Beef liver, raw', 'ingredient', 135, 20, 3.9, 3.6, 0, 0, 69, '{"vitamin_a_mcg":4968,"vitamin_b2_mg":2.8,"vitamin_b3_mg":13.2,"vitamin_b6_mg":0.9,"vitamin_b12_mcg":59.3,"folate_mcg":145,"iron_mg":4.9,"copper_mg":9.8,"zinc_mg":4}'::jsonb
where not exists (select 1 from foods where name = 'Beef liver, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Beef ribeye steak, raw', 'ingredient', 291, 19, 0, 24, 0, 0, 58, '{"vitamin_b12_mcg":1.8,"iron_mg":1.9,"phosphorus_mg":158,"selenium_mcg":15,"zinc_mg":4.2}'::jsonb
where not exists (select 1 from foods where name = 'Beef ribeye steak, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Beef brisket, raw', 'ingredient', 155, 20, 0, 8, 0, 0, 60, '{"vitamin_b12_mcg":1.8,"iron_mg":1.7,"zinc_mg":3.8}'::jsonb
where not exists (select 1 from foods where name = 'Beef brisket, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Venison, raw', 'ingredient', 120, 23, 0, 2.4, 0, 0, 51, '{"vitamin_b12_mcg":3.9,"iron_mg":3.4,"zinc_mg":3}'::jsonb
where not exists (select 1 from foods where name = 'Venison, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Duck breast, raw, skinless', 'ingredient', 140, 20, 0, 6, 0, 0, 74, '{"vitamin_b3_mg":6.7,"vitamin_b12_mcg":0.4,"iron_mg":4,"selenium_mcg":18}'::jsonb
where not exists (select 1 from foods where name = 'Duck breast, raw, skinless' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Deli turkey slices', 'ingredient', 104, 17, 3.4, 1.7, 0, 1.5, 1080, '{"vitamin_b3_mg":4.9,"vitamin_b12_mcg":0.3}'::jsonb
where not exists (select 1 from foods where name = 'Deli turkey slices' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Salmon, sockeye, raw', 'ingredient', 168, 22, 0, 8.6, 0, 0, 47, '{"vitamin_d_mcg":8.9,"vitamin_b12_mcg":5.9,"potassium_mg":505,"selenium_mcg":37}'::jsonb
where not exists (select 1 from foods where name = 'Salmon, sockeye, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Halibut, raw', 'ingredient', 111, 21, 0, 2.3, 0, 0, 59, '{"vitamin_b12_mcg":1,"potassium_mg":490,"selenium_mcg":37,"magnesium_mg":30}'::jsonb
where not exists (select 1 from foods where name = 'Halibut, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Sardines, canned in oil', 'ingredient', 208, 25, 0, 11.5, 0, 0, 307, '{"vitamin_d_mcg":4.8,"vitamin_b12_mcg":8.9,"calcium_mg":382,"phosphorus_mg":490,"selenium_mcg":53}'::jsonb
where not exists (select 1 from foods where name = 'Sardines, canned in oil' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Mackerel, raw', 'ingredient', 205, 19, 0, 14, 0, 0, 90, '{"vitamin_d_mcg":16.1,"vitamin_b12_mcg":8.7,"selenium_mcg":44}'::jsonb
where not exists (select 1 from foods where name = 'Mackerel, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Trout, raw', 'ingredient', 148, 20, 0, 6.6, 0, 0, 52, '{"vitamin_d_mcg":8,"vitamin_b12_mcg":5.4,"potassium_mg":463}'::jsonb
where not exists (select 1 from foods where name = 'Trout, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Crab, raw', 'ingredient', 84, 18, 0, 1, 0, 0, 293, '{"vitamin_b12_mcg":5.4,"zinc_mg":3.5,"copper_mg":0.6,"selenium_mcg":27}'::jsonb
where not exists (select 1 from foods where name = 'Crab, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Scallops, raw', 'ingredient', 88, 17, 2.4, 0.8, 0, 0, 161, '{"vitamin_b12_mcg":1.6,"magnesium_mg":27,"potassium_mg":314,"selenium_mcg":23}'::jsonb
where not exists (select 1 from foods where name = 'Scallops, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Mussels, raw', 'ingredient', 86, 12, 3.7, 2.2, 0, 0, 286, '{"vitamin_b12_mcg":12,"iron_mg":3.9,"selenium_mcg":45}'::jsonb
where not exists (select 1 from foods where name = 'Mussels, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Oysters, raw', 'ingredient', 68, 7, 3.9, 2.5, 0, 0, 106, '{"vitamin_b12_mcg":16,"zinc_mg":39.3,"copper_mg":3.7,"selenium_mcg":63}'::jsonb
where not exists (select 1 from foods where name = 'Oysters, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Anchovies, canned in oil', 'ingredient', 210, 29, 0, 10, 0, 0, 3668, '{"vitamin_b12_mcg":0.9,"calcium_mg":147,"selenium_mcg":36}'::jsonb
where not exists (select 1 from foods where name = 'Anchovies, canned in oil' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Tuna, canned in water', 'ingredient', 116, 26, 0, 0.8, 0, 0, 247, '{"vitamin_b3_mg":11.5,"vitamin_b12_mcg":2.2,"selenium_mcg":80}'::jsonb
where not exists (select 1 from foods where name = 'Tuna, canned in water' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Egg yolk, raw', 'ingredient', 322, 16, 3.6, 27, 0, 0.6, 48, '{"vitamin_a_mcg":381,"vitamin_d_mcg":5.4,"vitamin_b12_mcg":1.9,"folate_mcg":146,"calcium_mg":129,"iron_mg":2.7,"cholesterol_mg":1085}'::jsonb
where not exists (select 1 from foods where name = 'Egg yolk, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Duck egg, raw', 'ingredient', 185, 13, 1.5, 14, 0, 0, 146, '{"vitamin_a_mcg":194,"vitamin_b12_mcg":3.8,"iron_mg":3.9}'::jsonb
where not exists (select 1 from foods where name = 'Duck egg, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Swiss cheese', 'ingredient', 380, 27, 5.4, 28, 0, 1, 192, '{"vitamin_a_mcg":231,"vitamin_b12_mcg":3.3,"calcium_mg":791,"zinc_mg":4.4}'::jsonb
where not exists (select 1 from foods where name = 'Swiss cheese' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Feta cheese', 'ingredient', 264, 14, 4.1, 21, 0, 4.1, 917, '{"vitamin_a_mcg":179,"calcium_mg":493,"phosphorus_mg":337}'::jsonb
where not exists (select 1 from foods where name = 'Feta cheese' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Parmesan cheese', 'ingredient', 431, 38, 4.1, 29, 0, 0.9, 1529, '{"vitamin_a_mcg":242,"calcium_mg":1184,"phosphorus_mg":694,"zinc_mg":2.8}'::jsonb
where not exists (select 1 from foods where name = 'Parmesan cheese' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cream cheese', 'ingredient', 342, 6, 4.1, 34, 0, 3.2, 321, '{"vitamin_a_mcg":308,"calcium_mg":98}'::jsonb
where not exists (select 1 from foods where name = 'Cream cheese' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Butter, salted', 'ingredient', 717, 0.9, 0.1, 81, 0, 0.1, 643, '{"vitamin_a_mcg":684,"saturated_g":51,"monounsaturated_g":21,"cholesterol_mg":215}'::jsonb
where not exists (select 1 from foods where name = 'Butter, salted' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Heavy cream', 'ingredient', 340, 2.1, 2.8, 36, 0, 2.9, 27, '{"vitamin_a_mcg":353,"calcium_mg":65,"cholesterol_mg":137}'::jsonb
where not exists (select 1 from foods where name = 'Heavy cream' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Sour cream', 'ingredient', 193, 2.4, 4.6, 19, 0, 3.4, 31, '{"vitamin_a_mcg":163,"calcium_mg":116}'::jsonb
where not exists (select 1 from foods where name = 'Sour cream' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Oat milk, unsweetened', 'ingredient', 46, 1, 7.7, 1.5, 0.8, 3.3, 60, '{"calcium_mg":120,"vitamin_d_mcg":1.1}'::jsonb
where not exists (select 1 from foods where name = 'Oat milk, unsweetened' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Almond milk, unsweetened', 'ingredient', 15, 0.6, 0.6, 1.2, 0.3, 0.2, 63, '{"calcium_mg":188,"vitamin_e_mg":4.4,"vitamin_d_mcg":1}'::jsonb
where not exists (select 1 from foods where name = 'Almond milk, unsweetened' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Soy milk, unsweetened', 'ingredient', 33, 3.3, 1.8, 1.8, 0.6, 1, 51, '{"calcium_mg":120,"vitamin_b12_mcg":1.2,"potassium_mg":118}'::jsonb
where not exists (select 1 from foods where name = 'Soy milk, unsweetened' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Brussels sprouts, raw', 'ingredient', 43, 3.4, 9, 0.3, 3.8, 2.2, 25, '{"vitamin_c_mg":85,"vitamin_k_mcg":177,"folate_mcg":61,"potassium_mg":389}'::jsonb
where not exists (select 1 from foods where name = 'Brussels sprouts, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cabbage, raw', 'ingredient', 25, 1.3, 5.8, 0.1, 2.5, 3.2, 18, '{"vitamin_c_mg":36.6,"vitamin_k_mcg":76,"potassium_mg":170}'::jsonb
where not exists (select 1 from foods where name = 'Cabbage, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Celery, raw', 'ingredient', 14, 0.7, 3, 0.2, 1.6, 1.3, 80, '{"vitamin_k_mcg":29,"potassium_mg":260,"folate_mcg":36}'::jsonb
where not exists (select 1 from foods where name = 'Celery, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Eggplant, raw', 'ingredient', 25, 1, 6, 0.2, 3, 3.5, 2, '{"potassium_mg":229,"manganese_mg":0.2,"vitamin_b6_mg":0.1}'::jsonb
where not exists (select 1 from foods where name = 'Eggplant, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Radish, raw', 'ingredient', 16, 0.7, 3.4, 0.1, 1.6, 1.9, 39, '{"vitamin_c_mg":14.8,"potassium_mg":233}'::jsonb
where not exists (select 1 from foods where name = 'Radish, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Beets, raw', 'ingredient', 43, 1.6, 10, 0.2, 2.8, 6.8, 78, '{"folate_mcg":109,"potassium_mg":325,"manganese_mg":0.3}'::jsonb
where not exists (select 1 from foods where name = 'Beets, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Turnip, raw', 'ingredient', 28, 0.9, 6.4, 0.1, 1.8, 3.8, 67, '{"vitamin_c_mg":21,"potassium_mg":191}'::jsonb
where not exists (select 1 from foods where name = 'Turnip, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Butternut squash, raw', 'ingredient', 45, 1, 12, 0.1, 2, 2.2, 4, '{"vitamin_a_mcg":358,"vitamin_c_mg":21,"potassium_mg":352}'::jsonb
where not exists (select 1 from foods where name = 'Butternut squash, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Acorn squash, raw', 'ingredient', 40, 0.8, 10.4, 0.1, 1.5, 0, 4, '{"vitamin_c_mg":11,"potassium_mg":350}'::jsonb
where not exists (select 1 from foods where name = 'Acorn squash, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Pumpkin, raw', 'ingredient', 26, 1, 6.5, 0.1, 0.5, 2.8, 1, '{"vitamin_a_mcg":426,"potassium_mg":340}'::jsonb
where not exists (select 1 from foods where name = 'Pumpkin, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Corn, sweet, raw', 'ingredient', 86, 3.3, 19, 1.4, 2, 6.3, 15, '{"vitamin_c_mg":6.8,"folate_mcg":42,"potassium_mg":270,"magnesium_mg":37}'::jsonb
where not exists (select 1 from foods where name = 'Corn, sweet, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Peas, green, raw', 'ingredient', 81, 5.4, 14, 0.4, 5.7, 5.7, 5, '{"vitamin_c_mg":40,"vitamin_k_mcg":25,"folate_mcg":65,"iron_mg":1.5,"potassium_mg":244}'::jsonb
where not exists (select 1 from foods where name = 'Peas, green, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Artichoke, raw', 'ingredient', 47, 3.3, 11, 0.2, 5.4, 1, 94, '{"vitamin_c_mg":11.7,"folate_mcg":68,"magnesium_mg":60,"potassium_mg":370}'::jsonb
where not exists (select 1 from foods where name = 'Artichoke, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Leek, raw', 'ingredient', 61, 1.5, 14, 0.3, 1.8, 3.9, 20, '{"vitamin_a_mcg":83,"vitamin_c_mg":12,"vitamin_k_mcg":47}'::jsonb
where not exists (select 1 from foods where name = 'Leek, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Garlic, raw', 'ingredient', 149, 6.4, 33, 0.5, 2.1, 1, 17, '{"vitamin_c_mg":31.2,"vitamin_b6_mg":1.2,"manganese_mg":1.7,"selenium_mcg":14}'::jsonb
where not exists (select 1 from foods where name = 'Garlic, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Ginger, raw', 'ingredient', 80, 1.8, 18, 0.8, 2, 1.7, 13, '{"magnesium_mg":43,"potassium_mg":415,"manganese_mg":0.2}'::jsonb
where not exists (select 1 from foods where name = 'Ginger, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Bok choy, raw', 'ingredient', 13, 1.5, 2.2, 0.2, 1, 1.2, 65, '{"vitamin_a_mcg":243,"vitamin_c_mg":45,"vitamin_k_mcg":46,"calcium_mg":105}'::jsonb
where not exists (select 1 from foods where name = 'Bok choy, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Collard greens, raw', 'ingredient', 32, 3, 5.4, 0.6, 4, 0.5, 20, '{"vitamin_a_mcg":333,"vitamin_c_mg":35,"vitamin_k_mcg":437,"calcium_mg":232}'::jsonb
where not exists (select 1 from foods where name = 'Collard greens, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Swiss chard, raw', 'ingredient', 19, 1.8, 3.7, 0.2, 1.6, 1.1, 213, '{"vitamin_a_mcg":306,"vitamin_c_mg":30,"vitamin_k_mcg":830,"magnesium_mg":81,"potassium_mg":379}'::jsonb
where not exists (select 1 from foods where name = 'Swiss chard, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Snap peas, raw', 'ingredient', 42, 2.8, 7.6, 0.2, 2.6, 4, 4, '{"vitamin_a_mcg":38,"vitamin_c_mg":60,"vitamin_k_mcg":25,"folate_mcg":42}'::jsonb
where not exists (select 1 from foods where name = 'Snap peas, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Pineapple, raw', 'ingredient', 50, 0.5, 13, 0.1, 1.4, 10, 1, '{"vitamin_c_mg":47.8,"manganese_mg":0.9,"potassium_mg":109}'::jsonb
where not exists (select 1 from foods where name = 'Pineapple, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Mango, raw', 'ingredient', 60, 0.8, 15, 0.4, 1.6, 14, 1, '{"vitamin_a_mcg":54,"vitamin_c_mg":36.4,"folate_mcg":43,"potassium_mg":168}'::jsonb
where not exists (select 1 from foods where name = 'Mango, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Papaya, raw', 'ingredient', 43, 0.5, 11, 0.3, 1.7, 7.8, 8, '{"vitamin_a_mcg":47,"vitamin_c_mg":60.9,"folate_mcg":37,"potassium_mg":182}'::jsonb
where not exists (select 1 from foods where name = 'Papaya, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Kiwi, raw', 'ingredient', 61, 1.1, 15, 0.5, 3, 9, 3, '{"vitamin_c_mg":92.7,"vitamin_k_mcg":40,"vitamin_e_mg":1.5,"potassium_mg":312}'::jsonb
where not exists (select 1 from foods where name = 'Kiwi, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Pear, raw', 'ingredient', 57, 0.4, 15, 0.1, 3.1, 10, 1, '{"vitamin_c_mg":4.3,"potassium_mg":116}'::jsonb
where not exists (select 1 from foods where name = 'Pear, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Peach, raw', 'ingredient', 39, 0.9, 9.5, 0.3, 1.5, 8.4, 0, '{"vitamin_a_mcg":16,"vitamin_c_mg":6.6,"potassium_mg":190}'::jsonb
where not exists (select 1 from foods where name = 'Peach, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Plum, raw', 'ingredient', 46, 0.7, 11, 0.3, 1.4, 10, 0, '{"vitamin_c_mg":9.5,"vitamin_a_mcg":17,"potassium_mg":157}'::jsonb
where not exists (select 1 from foods where name = 'Plum, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cherries, raw', 'ingredient', 63, 1.1, 16, 0.2, 2.1, 13, 0, '{"vitamin_c_mg":7,"potassium_mg":222}'::jsonb
where not exists (select 1 from foods where name = 'Cherries, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Watermelon, raw', 'ingredient', 30, 0.6, 7.6, 0.2, 0.4, 6.2, 1, '{"vitamin_a_mcg":28,"vitamin_c_mg":8.1,"potassium_mg":112}'::jsonb
where not exists (select 1 from foods where name = 'Watermelon, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cantaloupe, raw', 'ingredient', 34, 0.8, 8, 0.2, 0.9, 8, 16, '{"vitamin_a_mcg":169,"vitamin_c_mg":36.7,"potassium_mg":267}'::jsonb
where not exists (select 1 from foods where name = 'Cantaloupe, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Raspberries, raw', 'ingredient', 52, 1.2, 12, 0.7, 6.5, 4.4, 1, '{"vitamin_c_mg":26.2,"manganese_mg":0.7,"potassium_mg":151}'::jsonb
where not exists (select 1 from foods where name = 'Raspberries, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Blackberries, raw', 'ingredient', 43, 1.4, 10, 0.5, 5.3, 4.9, 1, '{"vitamin_c_mg":21,"vitamin_k_mcg":19.8,"manganese_mg":0.6}'::jsonb
where not exists (select 1 from foods where name = 'Blackberries, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Pomegranate, raw', 'ingredient', 83, 1.7, 19, 1.2, 4, 14, 3, '{"vitamin_c_mg":10.2,"vitamin_k_mcg":16.4,"potassium_mg":236}'::jsonb
where not exists (select 1 from foods where name = 'Pomegranate, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Dates, dried', 'ingredient', 277, 1.8, 75, 0.2, 6.7, 63, 1, '{"potassium_mg":696,"magnesium_mg":54,"copper_mg":0.4,"manganese_mg":0.3}'::jsonb
where not exists (select 1 from foods where name = 'Dates, dried' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Raisins', 'ingredient', 299, 3.1, 79, 0.5, 3.7, 59, 11, '{"potassium_mg":749,"iron_mg":1.9,"copper_mg":0.3}'::jsonb
where not exists (select 1 from foods where name = 'Raisins' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Figs, raw', 'ingredient', 74, 0.8, 19, 0.3, 2.9, 16, 1, '{"vitamin_k_mcg":4.7,"potassium_mg":232,"calcium_mg":35}'::jsonb
where not exists (select 1 from foods where name = 'Figs, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Grapefruit, raw', 'ingredient', 42, 0.8, 11, 0.1, 1.6, 7, 0, '{"vitamin_a_mcg":46,"vitamin_c_mg":31.2,"potassium_mg":135}'::jsonb
where not exists (select 1 from foods where name = 'Grapefruit, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Lemon, raw', 'ingredient', 29, 1.1, 9.3, 0.3, 2.8, 2.5, 2, '{"vitamin_c_mg":53,"potassium_mg":138}'::jsonb
where not exists (select 1 from foods where name = 'Lemon, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Coconut, raw meat', 'ingredient', 354, 3.3, 15, 33, 9, 6.2, 20, '{"saturated_g":30,"manganese_mg":1.5,"copper_mg":0.4,"potassium_mg":356}'::jsonb
where not exists (select 1 from foods where name = 'Coconut, raw meat' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cranberries, raw', 'ingredient', 46, 0.4, 12, 0.1, 4.6, 4, 2, '{"vitamin_c_mg":13.3,"vitamin_e_mg":1.2,"manganese_mg":0.4}'::jsonb
where not exists (select 1 from foods where name = 'Cranberries, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Barley, cooked', 'ingredient', 123, 2.3, 28, 0.4, 3.8, 0.3, 3, '{"magnesium_mg":22,"manganese_mg":0.5,"selenium_mcg":13.6}'::jsonb
where not exists (select 1 from foods where name = 'Barley, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Buckwheat, cooked', 'ingredient', 92, 3.4, 20, 0.6, 2.7, 0.9, 1, '{"magnesium_mg":51,"manganese_mg":0.6,"copper_mg":0.2}'::jsonb
where not exists (select 1 from foods where name = 'Buckwheat, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Couscous, cooked', 'ingredient', 112, 3.8, 23, 0.2, 1.4, 0.1, 5, '{"selenium_mcg":21.5,"folate_mcg":12}'::jsonb
where not exists (select 1 from foods where name = 'Couscous, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Farro, cooked', 'ingredient', 170, 6, 34, 1.5, 5, 1, 5, '{"magnesium_mg":43,"zinc_mg":1.5}'::jsonb
where not exists (select 1 from foods where name = 'Farro, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Millet, cooked', 'ingredient', 119, 3.5, 24, 1, 1.3, 0, 2, '{"magnesium_mg":44,"phosphorus_mg":100,"manganese_mg":0.6}'::jsonb
where not exists (select 1 from foods where name = 'Millet, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cornmeal, dry', 'ingredient', 370, 8, 79, 3.9, 7.3, 0.6, 5, '{"vitamin_b1_mg":0.4,"iron_mg":3.5,"magnesium_mg":120}'::jsonb
where not exists (select 1 from foods where name = 'Cornmeal, dry' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Rye bread', 'ingredient', 259, 8.5, 48, 3.3, 5.8, 3.9, 603, '{"vitamin_b1_mg":0.3,"magnesium_mg":40,"manganese_mg":1.5}'::jsonb
where not exists (select 1 from foods where name = 'Rye bread' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Sourdough bread', 'ingredient', 289, 12, 56, 1.4, 2.6, 4.9, 572, '{"vitamin_b1_mg":0.4,"iron_mg":3.5,"selenium_mcg":30}'::jsonb
where not exists (select 1 from foods where name = 'Sourdough bread' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Bagel, plain', 'ingredient', 257, 10, 50, 1.5, 2.1, 6, 490, '{"vitamin_b1_mg":0.4,"folate_mcg":89,"iron_mg":3.1}'::jsonb
where not exists (select 1 from foods where name = 'Bagel, plain' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Tortilla, corn', 'ingredient', 218, 5.7, 45, 2.9, 6.4, 0.9, 12, '{"calcium_mg":120,"magnesium_mg":74}'::jsonb
where not exists (select 1 from foods where name = 'Tortilla, corn' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Tortilla, flour', 'ingredient', 312, 8.2, 51, 8, 3, 2, 611, '{"calcium_mg":130,"iron_mg":3.5}'::jsonb
where not exists (select 1 from foods where name = 'Tortilla, flour' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Rice cakes, plain', 'ingredient', 387, 8.2, 81, 2.8, 4, 0.4, 30, '{"magnesium_mg":110,"manganese_mg":3.4}'::jsonb
where not exists (select 1 from foods where name = 'Rice cakes, plain' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Kidney beans, cooked', 'ingredient', 127, 8.7, 23, 0.5, 6.4, 0.3, 2, '{"iron_mg":2.9,"magnesium_mg":45,"folate_mcg":130,"potassium_mg":403}'::jsonb
where not exists (select 1 from foods where name = 'Kidney beans, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Pinto beans, cooked', 'ingredient', 143, 9, 26, 0.7, 9, 0.3, 1, '{"iron_mg":2.1,"magnesium_mg":50,"folate_mcg":172,"potassium_mg":436}'::jsonb
where not exists (select 1 from foods where name = 'Pinto beans, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Navy beans, cooked', 'ingredient', 140, 8.2, 26, 0.6, 10.5, 0.3, 1, '{"iron_mg":2.4,"magnesium_mg":53,"folate_mcg":140,"potassium_mg":389}'::jsonb
where not exists (select 1 from foods where name = 'Navy beans, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Edamame, cooked', 'ingredient', 121, 11, 10, 5.2, 5.2, 2.2, 6, '{"vitamin_k_mcg":21,"folate_mcg":311,"magnesium_mg":64,"iron_mg":2.1}'::jsonb
where not exists (select 1 from foods where name = 'Edamame, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Tofu, firm', 'ingredient', 144, 15, 3, 9, 2.3, 0.6, 14, '{"calcium_mg":350,"iron_mg":2.7,"magnesium_mg":30,"manganese_mg":0.7}'::jsonb
where not exists (select 1 from foods where name = 'Tofu, firm' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Tempeh', 'ingredient', 192, 20, 8, 11, 0, 0, 9, '{"magnesium_mg":81,"manganese_mg":1.3,"phosphorus_mg":266}'::jsonb
where not exists (select 1 from foods where name = 'Tempeh' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Walnuts, raw', 'ingredient', 654, 15, 14, 65, 6.7, 2.6, 2, '{"omega3_g":9.1,"magnesium_mg":158,"copper_mg":1.6,"manganese_mg":3.4}'::jsonb
where not exists (select 1 from foods where name = 'Walnuts, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cashews, raw', 'ingredient', 553, 18, 30, 44, 3.3, 5.9, 12, '{"magnesium_mg":292,"copper_mg":2.2,"zinc_mg":5.8,"iron_mg":6.7}'::jsonb
where not exists (select 1 from foods where name = 'Cashews, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Pistachios, raw', 'ingredient', 560, 20, 28, 45, 10, 7.7, 1, '{"vitamin_b6_mg":1.7,"potassium_mg":1025,"copper_mg":1.3,"manganese_mg":1.2}'::jsonb
where not exists (select 1 from foods where name = 'Pistachios, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Pecans, raw', 'ingredient', 691, 9.2, 14, 72, 9.6, 4, 0, '{"manganese_mg":4.5,"copper_mg":1.2,"zinc_mg":4.5}'::jsonb
where not exists (select 1 from foods where name = 'Pecans, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Chia seeds', 'ingredient', 486, 17, 42, 31, 34, 0, 16, '{"omega3_g":17.8,"calcium_mg":631,"magnesium_mg":335,"phosphorus_mg":860}'::jsonb
where not exists (select 1 from foods where name = 'Chia seeds' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Flaxseeds, ground', 'ingredient', 534, 18, 29, 42, 27, 1.6, 30, '{"omega3_g":22.8,"magnesium_mg":392,"manganese_mg":2.5,"copper_mg":1.2}'::jsonb
where not exists (select 1 from foods where name = 'Flaxseeds, ground' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Pumpkin seeds, raw', 'ingredient', 559, 30, 11, 49, 6, 1.4, 7, '{"magnesium_mg":592,"zinc_mg":7.8,"iron_mg":8.8,"phosphorus_mg":1233}'::jsonb
where not exists (select 1 from foods where name = 'Pumpkin seeds, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Sunflower seeds, raw', 'ingredient', 584, 21, 20, 51, 8.6, 2.6, 9, '{"vitamin_e_mg":35.2,"vitamin_b6_mg":0.8,"magnesium_mg":325,"selenium_mcg":53}'::jsonb
where not exists (select 1 from foods where name = 'Sunflower seeds, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Sesame seeds, raw', 'ingredient', 573, 18, 23, 50, 12, 0.3, 11, '{"calcium_mg":975,"iron_mg":14.6,"magnesium_mg":351,"copper_mg":4.1}'::jsonb
where not exists (select 1 from foods where name = 'Sesame seeds, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Hazelnuts, raw', 'ingredient', 628, 15, 17, 61, 9.7, 4.3, 0, '{"vitamin_e_mg":15,"manganese_mg":6.2,"copper_mg":1.7}'::jsonb
where not exists (select 1 from foods where name = 'Hazelnuts, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Brazil nuts, raw', 'ingredient', 659, 14, 12, 67, 7.5, 2.3, 3, '{"selenium_mcg":1917,"magnesium_mg":376,"copper_mg":1.7}'::jsonb
where not exists (select 1 from foods where name = 'Brazil nuts, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Olive oil', 'ingredient', 884, 0, 0, 100, 0, 0, 2, '{"monounsaturated_g":73,"saturated_g":14,"polyunsaturated_g":11,"vitamin_e_mg":14.4,"vitamin_k_mcg":60.2}'::jsonb
where not exists (select 1 from foods where name = 'Olive oil' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Coconut oil', 'ingredient', 862, 0, 0, 100, 0, 0, 0, '{"saturated_g":87,"monounsaturated_g":6,"polyunsaturated_g":2}'::jsonb
where not exists (select 1 from foods where name = 'Coconut oil' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Avocado oil', 'ingredient', 884, 0, 0, 100, 0, 0, 0, '{"monounsaturated_g":70,"saturated_g":12,"polyunsaturated_g":14,"vitamin_e_mg":7.6}'::jsonb
where not exists (select 1 from foods where name = 'Avocado oil' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Canola oil', 'ingredient', 884, 0, 0, 100, 0, 0, 0, '{"monounsaturated_g":63,"polyunsaturated_g":28,"saturated_g":7,"omega3_g":9.1}'::jsonb
where not exists (select 1 from foods where name = 'Canola oil' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Sesame oil', 'ingredient', 884, 0, 0, 100, 0, 0, 0, '{"monounsaturated_g":40,"polyunsaturated_g":42,"saturated_g":14,"vitamin_e_mg":1.4}'::jsonb
where not exists (select 1 from foods where name = 'Sesame oil' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Ghee', 'ingredient', 900, 0, 0, 100, 0, 0, 0, '{"saturated_g":62,"vitamin_a_mcg":869,"cholesterol_mg":256}'::jsonb
where not exists (select 1 from foods where name = 'Ghee' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Lard', 'ingredient', 902, 0, 0, 100, 0, 0, 0, '{"saturated_g":39,"monounsaturated_g":45,"cholesterol_mg":95}'::jsonb
where not exists (select 1 from foods where name = 'Lard' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Mayonnaise', 'ingredient', 680, 1, 0.6, 75, 0, 0.6, 635, '{"vitamin_e_mg":22.2,"vitamin_k_mcg":65.7,"cholesterol_mg":42}'::jsonb
where not exists (select 1 from foods where name = 'Mayonnaise' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cinnamon, ground', 'ingredient', 247, 4, 81, 1.2, 53, 2.2, 10, '{"calcium_mg":1002,"manganese_mg":17.5,"iron_mg":8.3}'::jsonb
where not exists (select 1 from foods where name = 'Cinnamon, ground' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Turmeric, ground', 'ingredient', 312, 9.7, 67, 3.3, 23, 3.2, 27, '{"iron_mg":41.4,"manganese_mg":7.8,"potassium_mg":2525}'::jsonb
where not exists (select 1 from foods where name = 'Turmeric, ground' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Black pepper, ground', 'ingredient', 251, 10, 64, 3.3, 25, 0.6, 20, '{"iron_mg":9.7,"manganese_mg":5.6,"vitamin_k_mcg":163.7}'::jsonb
where not exists (select 1 from foods where name = 'Black pepper, ground' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Basil, fresh', 'ingredient', 23, 3.2, 2.7, 0.6, 1.6, 0.3, 4, '{"vitamin_a_mcg":264,"vitamin_k_mcg":414.8,"calcium_mg":177}'::jsonb
where not exists (select 1 from foods where name = 'Basil, fresh' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Parsley, fresh', 'ingredient', 36, 3, 6.3, 0.8, 3.3, 0.9, 56, '{"vitamin_a_mcg":421,"vitamin_c_mg":133,"vitamin_k_mcg":1640,"folate_mcg":152}'::jsonb
where not exists (select 1 from foods where name = 'Parsley, fresh' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cilantro, fresh', 'ingredient', 23, 2.1, 3.7, 0.5, 2.8, 0.9, 46, '{"vitamin_a_mcg":337,"vitamin_k_mcg":310,"potassium_mg":521}'::jsonb
where not exists (select 1 from foods where name = 'Cilantro, fresh' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Rosemary, fresh', 'ingredient', 131, 3.3, 21, 5.9, 14, 0, 26, '{"calcium_mg":317,"iron_mg":6.7,"manganese_mg":0.9}'::jsonb
where not exists (select 1 from foods where name = 'Rosemary, fresh' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cumin, ground', 'ingredient', 375, 18, 44, 22, 11, 2.3, 168, '{"iron_mg":66.4,"calcium_mg":931,"manganese_mg":3.3}'::jsonb
where not exists (select 1 from foods where name = 'Cumin, ground' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Paprika', 'ingredient', 282, 14, 54, 13, 35, 10, 68, '{"vitamin_a_mcg":2364,"vitamin_e_mg":29.1,"iron_mg":21.1}'::jsonb
where not exists (select 1 from foods where name = 'Paprika' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Oregano, dried', 'ingredient', 265, 9, 69, 4.3, 43, 4.1, 25, '{"vitamin_k_mcg":622,"iron_mg":36.8,"calcium_mg":1597,"manganese_mg":4.9}'::jsonb
where not exists (select 1 from foods where name = 'Oregano, dried' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Ketchup', 'ingredient', 101, 1, 27, 0.1, 0.3, 22, 1110, '{"vitamin_c_mg":4.5,"potassium_mg":281}'::jsonb
where not exists (select 1 from foods where name = 'Ketchup' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Yellow mustard', 'ingredient', 66, 4.4, 5, 3.3, 3, 2, 1120, '{"magnesium_mg":43}'::jsonb
where not exists (select 1 from foods where name = 'Yellow mustard' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Soy sauce', 'ingredient', 53, 8, 4.9, 0.1, 0.8, 0.4, 5493, '{"potassium_mg":318}'::jsonb
where not exists (select 1 from foods where name = 'Soy sauce' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Hot sauce', 'ingredient', 12, 0.5, 2, 0.4, 0.3, 0.6, 1552, '{"vitamin_c_mg":5}'::jsonb
where not exists (select 1 from foods where name = 'Hot sauce' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'BBQ sauce', 'ingredient', 172, 0.6, 41, 0.6, 1.1, 33, 921, '{}'::jsonb
where not exists (select 1 from foods where name = 'BBQ sauce' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Salsa', 'ingredient', 36, 1.6, 7.5, 0.2, 1.9, 4, 570, '{"vitamin_c_mg":9,"vitamin_a_mcg":34}'::jsonb
where not exists (select 1 from foods where name = 'Salsa' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Hummus', 'ingredient', 166, 7.9, 14, 9.6, 6, 0.3, 379, '{"folate_mcg":88,"iron_mg":2.4,"magnesium_mg":39}'::jsonb
where not exists (select 1 from foods where name = 'Hummus' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Guacamole', 'ingredient', 150, 2, 8.5, 13, 6.7, 0.7, 350, '{"vitamin_c_mg":10,"folate_mcg":81,"potassium_mg":485}'::jsonb
where not exists (select 1 from foods where name = 'Guacamole' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Coffee, brewed, black', 'ingredient', 2, 0.3, 0, 0, 0, 0, 2, '{"caffeine_mg":40,"potassium_mg":49}'::jsonb
where not exists (select 1 from foods where name = 'Coffee, brewed, black' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Tea, green, brewed', 'ingredient', 1, 0, 0, 0, 0, 0, 1, '{"caffeine_mg":12}'::jsonb
where not exists (select 1 from foods where name = 'Tea, green, brewed' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Tea, black, brewed', 'ingredient', 1, 0, 0.3, 0, 0, 0, 3, '{"caffeine_mg":22}'::jsonb
where not exists (select 1 from foods where name = 'Tea, black, brewed' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Orange juice, fresh', 'ingredient', 45, 0.7, 10, 0.2, 0.2, 8.4, 1, '{"vitamin_c_mg":50,"folate_mcg":30,"potassium_mg":200}'::jsonb
where not exists (select 1 from foods where name = 'Orange juice, fresh' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Apple juice, unsweetened', 'ingredient', 46, 0.1, 11, 0.1, 0.2, 10, 4, '{"vitamin_c_mg":0.9,"potassium_mg":101}'::jsonb
where not exists (select 1 from foods where name = 'Apple juice, unsweetened' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Coconut water', 'ingredient', 19, 0.7, 3.7, 0.2, 1.1, 2.6, 105, '{"potassium_mg":250,"magnesium_mg":25}'::jsonb
where not exists (select 1 from foods where name = 'Coconut water' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Kombucha', 'ingredient', 30, 0, 7, 0, 0, 6, 10, '{}'::jsonb
where not exists (select 1 from foods where name = 'Kombucha' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Honey', 'ingredient', 304, 0.3, 82, 0, 0.2, 82, 4, '{"potassium_mg":52,"vitamin_c_mg":0.5}'::jsonb
where not exists (select 1 from foods where name = 'Honey' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Maple syrup', 'ingredient', 260, 0, 67, 0.1, 0, 60, 12, '{"calcium_mg":102,"manganese_mg":4.2,"zinc_mg":1.5}'::jsonb
where not exists (select 1 from foods where name = 'Maple syrup' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Dark chocolate, 70-85% cacao', 'ingredient', 598, 7.8, 46, 43, 11, 24, 20, '{"iron_mg":11.9,"magnesium_mg":228,"copper_mg":1.8,"manganese_mg":1.9}'::jsonb
where not exists (select 1 from foods where name = 'Dark chocolate, 70-85% cacao' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Protein powder, whey, plain', 'ingredient', 400, 80, 8, 6.7, 0, 4, 200, '{"calcium_mg":400,"vitamin_b12_mcg":1.2}'::jsonb
where not exists (select 1 from foods where name = 'Protein powder, whey, plain' and source = 'ingredient');

