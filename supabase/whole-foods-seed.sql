-- Whole foods reference database (60 common staples: meats, fish,
-- eggs, dairy, vegetables, fruits, grains, legumes/nuts) with full
-- macro + micronutrient data per 100g. Standard USDA-style reference
-- values, the same figures used across most nutrition-label and
-- tracking-app databases. Safe to re-run — skips names that already
-- exist.

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Chicken breast, raw, skinless', 'ingredient', 165, 31, 0, 3.6, 0, 0, 74, '{"vitamin_a_mcg":6,"vitamin_d_mcg":0.1,"vitamin_b12_mcg":0.3,"folate_mcg":4,"calcium_mg":15,"iron_mg":0.7,"magnesium_mg":29,"potassium_mg":256,"zinc_mg":1}'::jsonb
where not exists (select 1 from foods where name = 'Chicken breast, raw, skinless' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Chicken thigh, raw, skinless', 'ingredient', 209, 26, 0, 10.9, 0, 0, 90, '{"vitamin_a_mcg":30,"vitamin_d_mcg":0.1,"vitamin_b12_mcg":0.3,"folate_mcg":7,"calcium_mg":10,"iron_mg":1.3,"magnesium_mg":20,"potassium_mg":229,"zinc_mg":2}'::jsonb
where not exists (select 1 from foods where name = 'Chicken thigh, raw, skinless' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Ground beef, 85/15, raw', 'ingredient', 215, 19, 0, 15, 0, 0, 66, '{"vitamin_b12_mcg":2.6,"folate_mcg":8,"calcium_mg":18,"iron_mg":2.2,"magnesium_mg":18,"potassium_mg":270,"zinc_mg":4.5}'::jsonb
where not exists (select 1 from foods where name = 'Ground beef, 85/15, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Ground beef, 93/7, raw', 'ingredient', 152, 21, 0, 7, 0, 0, 66, '{"vitamin_b12_mcg":2.6,"folate_mcg":8,"calcium_mg":18,"iron_mg":2.3,"magnesium_mg":20,"potassium_mg":300,"zinc_mg":4.6}'::jsonb
where not exists (select 1 from foods where name = 'Ground beef, 93/7, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Beef sirloin steak, raw', 'ingredient', 142, 21, 0, 6, 0, 0, 56, '{"vitamin_b12_mcg":2,"iron_mg":1.8,"magnesium_mg":23,"potassium_mg":315,"zinc_mg":4}'::jsonb
where not exists (select 1 from foods where name = 'Beef sirloin steak, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Pork chop, raw', 'ingredient', 143, 21, 0, 6, 0, 0, 57, '{"vitamin_b12_mcg":0.7,"iron_mg":0.7,"magnesium_mg":22,"potassium_mg":355,"zinc_mg":2}'::jsonb
where not exists (select 1 from foods where name = 'Pork chop, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Pork tenderloin, raw', 'ingredient', 120, 22, 0, 3, 0, 0, 50, '{"vitamin_b12_mcg":0.6,"iron_mg":1.2,"magnesium_mg":26,"potassium_mg":380,"zinc_mg":2}'::jsonb
where not exists (select 1 from foods where name = 'Pork tenderloin, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Bacon, cooked', 'ingredient', 541, 37, 1.4, 42, 0, 0, 1717, '{"vitamin_b12_mcg":0.6,"iron_mg":1.4,"potassium_mg":565,"zinc_mg":3}'::jsonb
where not exists (select 1 from foods where name = 'Bacon, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Turkey breast, raw, skinless', 'ingredient', 135, 30, 0, 0.7, 0, 0, 63, '{"vitamin_b12_mcg":0.3,"magnesium_mg":28,"potassium_mg":297,"zinc_mg":1.4}'::jsonb
where not exists (select 1 from foods where name = 'Turkey breast, raw, skinless' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Lamb, raw', 'ingredient', 258, 25, 0, 17, 0, 0, 72, '{"vitamin_b12_mcg":2.3,"iron_mg":1.6,"magnesium_mg":21,"potassium_mg":310,"zinc_mg":3.4}'::jsonb
where not exists (select 1 from foods where name = 'Lamb, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Salmon, Atlantic, raw', 'ingredient', 208, 20, 0, 13, 0, 0, 59, '{"vitamin_d_mcg":11,"vitamin_b12_mcg":3.2,"potassium_mg":363,"magnesium_mg":27,"calcium_mg":9}'::jsonb
where not exists (select 1 from foods where name = 'Salmon, Atlantic, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Tuna, yellowfin, raw', 'ingredient', 109, 24, 0, 0.5, 0, 0, 37, '{"vitamin_b12_mcg":0.5,"potassium_mg":252,"magnesium_mg":30}'::jsonb
where not exists (select 1 from foods where name = 'Tuna, yellowfin, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Shrimp, raw', 'ingredient', 85, 20, 0.2, 0.5, 0, 0, 119, '{"vitamin_b12_mcg":1.1,"calcium_mg":70,"iron_mg":0.5,"zinc_mg":1.3}'::jsonb
where not exists (select 1 from foods where name = 'Shrimp, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Tilapia, raw', 'ingredient', 96, 20, 0, 1.7, 0, 0, 52, '{"vitamin_b12_mcg":1.9,"potassium_mg":302}'::jsonb
where not exists (select 1 from foods where name = 'Tilapia, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cod, raw', 'ingredient', 82, 18, 0, 0.7, 0, 0, 54, '{"vitamin_b12_mcg":0.9,"potassium_mg":413}'::jsonb
where not exists (select 1 from foods where name = 'Cod, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Egg, whole, raw', 'ingredient', 143, 13, 1.1, 9.5, 0, 1.1, 142, '{"vitamin_a_mcg":160,"vitamin_d_mcg":2,"vitamin_b12_mcg":0.9,"folate_mcg":47,"calcium_mg":56,"iron_mg":1.8}'::jsonb
where not exists (select 1 from foods where name = 'Egg, whole, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Egg white, raw', 'ingredient', 52, 11, 0.7, 0.2, 0, 0.7, 166, '{"calcium_mg":7,"potassium_mg":163}'::jsonb
where not exists (select 1 from foods where name = 'Egg white, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Milk, whole (3.25%)', 'ingredient', 61, 3.2, 4.8, 3.3, 0, 5.1, 43, '{"vitamin_a_mcg":46,"vitamin_d_mcg":1.3,"calcium_mg":113,"potassium_mg":132}'::jsonb
where not exists (select 1 from foods where name = 'Milk, whole (3.25%)' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Milk, 2% reduced fat', 'ingredient', 50, 3.4, 4.9, 2, 0, 5.1, 44, '{"vitamin_a_mcg":68,"vitamin_d_mcg":1.2,"calcium_mg":120,"potassium_mg":150}'::jsonb
where not exists (select 1 from foods where name = 'Milk, 2% reduced fat' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Milk, skim', 'ingredient', 34, 3.4, 5, 0.1, 0, 5.1, 42, '{"vitamin_a_mcg":55,"vitamin_d_mcg":1.3,"calcium_mg":122,"potassium_mg":156}'::jsonb
where not exists (select 1 from foods where name = 'Milk, skim' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Greek yogurt, plain, nonfat', 'ingredient', 59, 10, 3.6, 0.4, 0, 3.2, 36, '{"calcium_mg":110,"vitamin_b12_mcg":0.5,"potassium_mg":141}'::jsonb
where not exists (select 1 from foods where name = 'Greek yogurt, plain, nonfat' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Greek yogurt, plain, whole milk', 'ingredient', 97, 9, 4, 5, 0, 4, 34, '{"calcium_mg":100,"vitamin_b12_mcg":0.5,"potassium_mg":132}'::jsonb
where not exists (select 1 from foods where name = 'Greek yogurt, plain, whole milk' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cheddar cheese', 'ingredient', 403, 25, 1.3, 33, 0, 0.5, 621, '{"vitamin_a_mcg":265,"calcium_mg":721,"zinc_mg":3.1}'::jsonb
where not exists (select 1 from foods where name = 'Cheddar cheese' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Mozzarella, part-skim', 'ingredient', 254, 24, 2.8, 16, 0, 1, 396, '{"vitamin_a_mcg":165,"calcium_mg":505,"zinc_mg":2.9}'::jsonb
where not exists (select 1 from foods where name = 'Mozzarella, part-skim' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cottage cheese, low-fat', 'ingredient', 72, 12, 3, 1, 0, 2.7, 330, '{"calcium_mg":83,"potassium_mg":104}'::jsonb
where not exists (select 1 from foods where name = 'Cottage cheese, low-fat' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Broccoli, raw', 'ingredient', 34, 2.8, 7, 0.4, 2.6, 1.7, 33, '{"vitamin_a_mcg":31,"vitamin_c_mg":89,"folate_mcg":63,"calcium_mg":47,"iron_mg":0.7,"potassium_mg":316}'::jsonb
where not exists (select 1 from foods where name = 'Broccoli, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Spinach, raw', 'ingredient', 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, '{"vitamin_a_mcg":469,"vitamin_c_mg":28,"folate_mcg":194,"calcium_mg":99,"iron_mg":2.7,"potassium_mg":558}'::jsonb
where not exists (select 1 from foods where name = 'Spinach, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Carrots, raw', 'ingredient', 41, 0.9, 10, 0.2, 2.8, 4.7, 69, '{"vitamin_a_mcg":835,"vitamin_c_mg":5.9,"calcium_mg":33,"potassium_mg":320}'::jsonb
where not exists (select 1 from foods where name = 'Carrots, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Sweet potato, raw', 'ingredient', 86, 1.6, 20, 0.1, 3, 4.2, 55, '{"vitamin_a_mcg":709,"vitamin_c_mg":2.4,"potassium_mg":337,"calcium_mg":30}'::jsonb
where not exists (select 1 from foods where name = 'Sweet potato, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Potato, white, raw', 'ingredient', 77, 2, 17, 0.1, 2.2, 0.8, 6, '{"vitamin_c_mg":19.7,"potassium_mg":425,"iron_mg":0.8}'::jsonb
where not exists (select 1 from foods where name = 'Potato, white, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Bell pepper, red, raw', 'ingredient', 31, 1, 6, 0.3, 2.1, 4.2, 4, '{"vitamin_a_mcg":157,"vitamin_c_mg":128,"potassium_mg":211}'::jsonb
where not exists (select 1 from foods where name = 'Bell pepper, red, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Onion, raw', 'ingredient', 40, 1.1, 9.3, 0.1, 1.7, 4.2, 4, '{"vitamin_c_mg":7.4,"folate_mcg":19,"potassium_mg":146}'::jsonb
where not exists (select 1 from foods where name = 'Onion, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Tomato, raw', 'ingredient', 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5, '{"vitamin_a_mcg":42,"vitamin_c_mg":14,"potassium_mg":237}'::jsonb
where not exists (select 1 from foods where name = 'Tomato, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cucumber, raw', 'ingredient', 15, 0.7, 3.6, 0.1, 0.5, 1.7, 2, '{"vitamin_c_mg":2.8,"potassium_mg":147}'::jsonb
where not exists (select 1 from foods where name = 'Cucumber, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Zucchini, raw', 'ingredient', 17, 1.2, 3.1, 0.3, 1, 2.5, 8, '{"vitamin_c_mg":17.9,"potassium_mg":261}'::jsonb
where not exists (select 1 from foods where name = 'Zucchini, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Asparagus, raw', 'ingredient', 20, 2.2, 3.9, 0.1, 2.1, 1.9, 2, '{"vitamin_a_mcg":38,"vitamin_c_mg":5.6,"folate_mcg":52,"potassium_mg":202}'::jsonb
where not exists (select 1 from foods where name = 'Asparagus, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Green beans, raw', 'ingredient', 31, 1.8, 7, 0.2, 2.7, 3.3, 6, '{"vitamin_a_mcg":35,"vitamin_c_mg":12.2,"potassium_mg":211}'::jsonb
where not exists (select 1 from foods where name = 'Green beans, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Kale, raw', 'ingredient', 49, 4.3, 8.8, 0.9, 3.6, 2.3, 38, '{"vitamin_a_mcg":500,"vitamin_c_mg":120,"calcium_mg":150,"iron_mg":1.5,"potassium_mg":348}'::jsonb
where not exists (select 1 from foods where name = 'Kale, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Cauliflower, raw', 'ingredient', 25, 1.9, 5, 0.3, 2, 1.9, 30, '{"vitamin_c_mg":48.2,"folate_mcg":57,"potassium_mg":299}'::jsonb
where not exists (select 1 from foods where name = 'Cauliflower, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Mushrooms, white, raw', 'ingredient', 22, 3.1, 3.3, 0.3, 1, 2, 5, '{"potassium_mg":318,"folate_mcg":17}'::jsonb
where not exists (select 1 from foods where name = 'Mushrooms, white, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Banana, raw', 'ingredient', 89, 1.1, 23, 0.3, 2.6, 12, 1, '{"vitamin_c_mg":8.7,"potassium_mg":358,"folate_mcg":20}'::jsonb
where not exists (select 1 from foods where name = 'Banana, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Apple, raw, with skin', 'ingredient', 52, 0.3, 14, 0.2, 2.4, 10, 1, '{"vitamin_c_mg":4.6,"potassium_mg":107}'::jsonb
where not exists (select 1 from foods where name = 'Apple, raw, with skin' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Orange, raw', 'ingredient', 47, 0.9, 12, 0.1, 2.4, 9, 0, '{"vitamin_c_mg":53,"folate_mcg":30,"potassium_mg":181}'::jsonb
where not exists (select 1 from foods where name = 'Orange, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Strawberries, raw', 'ingredient', 32, 0.7, 7.7, 0.3, 2, 4.9, 1, '{"vitamin_c_mg":59,"potassium_mg":153}'::jsonb
where not exists (select 1 from foods where name = 'Strawberries, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Blueberries, raw', 'ingredient', 57, 0.7, 14.5, 0.3, 2.4, 10, 1, '{"vitamin_c_mg":9.7,"potassium_mg":77}'::jsonb
where not exists (select 1 from foods where name = 'Blueberries, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Avocado, raw', 'ingredient', 160, 2, 8.5, 14.7, 6.7, 0.7, 7, '{"vitamin_c_mg":10,"folate_mcg":81,"potassium_mg":485,"magnesium_mg":29}'::jsonb
where not exists (select 1 from foods where name = 'Avocado, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Grapes, raw', 'ingredient', 69, 0.7, 18, 0.2, 0.9, 16, 2, '{"vitamin_c_mg":3.2,"potassium_mg":191}'::jsonb
where not exists (select 1 from foods where name = 'Grapes, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'White rice, cooked', 'ingredient', 130, 2.7, 28, 0.3, 0.4, 0.1, 1, '{"magnesium_mg":12,"potassium_mg":35}'::jsonb
where not exists (select 1 from foods where name = 'White rice, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Brown rice, cooked', 'ingredient', 123, 2.7, 25.6, 1, 1.6, 0.4, 4, '{"magnesium_mg":39,"potassium_mg":86}'::jsonb
where not exists (select 1 from foods where name = 'Brown rice, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Quinoa, cooked', 'ingredient', 120, 4.4, 21.3, 1.9, 2.8, 0.9, 7, '{"iron_mg":1.5,"magnesium_mg":64,"folate_mcg":42,"potassium_mg":172}'::jsonb
where not exists (select 1 from foods where name = 'Quinoa, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Oats, dry', 'ingredient', 389, 16.9, 66, 6.9, 10.6, 0, 2, '{"iron_mg":4.7,"magnesium_mg":177,"zinc_mg":4,"folate_mcg":56}'::jsonb
where not exists (select 1 from foods where name = 'Oats, dry' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Pasta, cooked', 'ingredient', 131, 5, 25, 1.1, 1.8, 0.6, 1, '{"folate_mcg":43,"magnesium_mg":18}'::jsonb
where not exists (select 1 from foods where name = 'Pasta, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'White bread', 'ingredient', 265, 9, 49, 3.2, 2.7, 5, 491, '{"folate_mcg":100,"calcium_mg":151,"iron_mg":3.6}'::jsonb
where not exists (select 1 from foods where name = 'White bread' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Whole wheat bread', 'ingredient', 247, 13, 41, 3.4, 6.8, 5.6, 400, '{"folate_mcg":30,"magnesium_mg":65,"iron_mg":2.5}'::jsonb
where not exists (select 1 from foods where name = 'Whole wheat bread' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Black beans, cooked', 'ingredient', 132, 8.9, 24, 0.5, 8.7, 0.3, 1, '{"iron_mg":2.1,"magnesium_mg":70,"potassium_mg":355,"folate_mcg":149}'::jsonb
where not exists (select 1 from foods where name = 'Black beans, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Chickpeas, cooked', 'ingredient', 164, 8.9, 27, 2.6, 7.6, 4.8, 7, '{"iron_mg":2.9,"magnesium_mg":48,"potassium_mg":291,"folate_mcg":172}'::jsonb
where not exists (select 1 from foods where name = 'Chickpeas, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Lentils, cooked', 'ingredient', 116, 9, 20, 0.4, 7.9, 1.8, 2, '{"iron_mg":3.3,"magnesium_mg":36,"potassium_mg":369,"folate_mcg":181}'::jsonb
where not exists (select 1 from foods where name = 'Lentils, cooked' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Almonds, raw', 'ingredient', 579, 21, 22, 50, 12.5, 4.4, 1, '{"calcium_mg":269,"magnesium_mg":270,"iron_mg":3.7,"potassium_mg":733,"zinc_mg":3.1}'::jsonb
where not exists (select 1 from foods where name = 'Almonds, raw' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Peanut butter', 'ingredient', 588, 25, 20, 50, 6, 9.2, 459, '{"magnesium_mg":168,"potassium_mg":649,"iron_mg":1.9}'::jsonb
where not exists (select 1 from foods where name = 'Peanut butter' and source = 'ingredient');

insert into foods (name, source, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, micronutrients)
select 'Peanuts, raw', 'ingredient', 567, 26, 16, 49, 8.5, 4, 18, '{"magnesium_mg":168,"potassium_mg":705,"iron_mg":4.6,"folate_mcg":240}'::jsonb
where not exists (select 1 from foods where name = 'Peanuts, raw' and source = 'ingredient');

