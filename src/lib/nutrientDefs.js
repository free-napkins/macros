// Full nutrient catalog, sectioned to match a standard nutrition-app
// breakdown (General / Carbohydrates / Lipids / Protein / Vitamins /
// Minerals). Each entry:
//   key       - matches the key in foods.micronutrients / totals, OR
//               'core:<field>' for values already stored as a
//               dedicated column (calories, protein_g, etc.)
//   label, unit
//   target    - how to compute a daily target, or null if there is no
//               established reference value (shown as an informational
//               number only, no target bar):
//     { type: 'rda', male: n, female: n }       fixed adult RDA/AI
//     { type: 'per-kg', mgPerKg: n }             amino acids: needs current weight
//     { type: 'upper-limit', value: n }          "stay under" (sodium, saturated fat, caffeine)
//
// Values not well-established per-food (individual amino acids beyond
// what's documented for common proteins, oxalate/phytate, fatty-acid
// sub-types) are only populated in the food database where solid
// reference data exists — the rest default to 0 rather than a guess.

export const SECTIONS = ['General', 'Carbohydrates', 'Lipids', 'Protein', 'Vitamins', 'Minerals']

export const NUTRIENT_DEFS = [
  // ---------------- General ----------------
  { key: 'core:calories', label: 'Energy', unit: 'kcal', section: 'General', target: null }, // handled by macro_goals elsewhere
  { key: 'alcohol_g', label: 'Alcohol', unit: 'g', section: 'General', target: null },
  { key: 'caffeine_mg', label: 'Caffeine', unit: 'mg', section: 'General', target: { type: 'upper-limit', value: 400 } },
  { key: 'oxalate_mg', label: 'Oxalate', unit: 'mg', section: 'General', target: null },
  { key: 'phytate_mg', label: 'Phytate', unit: 'mg', section: 'General', target: null },
  { key: 'water_g', label: 'Water', unit: 'g', section: 'General', target: { type: 'rda', male: 3700, female: 2700 } },

  // ---------------- Carbohydrates ----------------
  { key: 'core:carbs_g', label: 'Carbs', unit: 'g', section: 'Carbohydrates', target: null }, // handled by macro_goals
  { key: 'net_carbs_g', label: 'Net Carbs', unit: 'g', section: 'Carbohydrates', target: null, derived: 'netCarbs' },
  { key: 'core:fiber_g', label: 'Fiber', unit: 'g', section: 'Carbohydrates', target: { type: 'rda', male: 38, female: 25 } },
  { key: 'insoluble_fiber_g', label: 'Insoluble Fiber', unit: 'g', section: 'Carbohydrates', target: null },
  { key: 'soluble_fiber_g', label: 'Soluble Fiber', unit: 'g', section: 'Carbohydrates', target: null },
  { key: 'starch_g', label: 'Starch', unit: 'g', section: 'Carbohydrates', target: null },
  { key: 'core:sugar_g', label: 'Sugars', unit: 'g', section: 'Carbohydrates', target: null },

  // ---------------- Lipids ----------------
  { key: 'core:fat_g', label: 'Fat', unit: 'g', section: 'Lipids', target: null }, // handled by macro_goals
  { key: 'monounsaturated_g', label: 'Monounsaturated', unit: 'g', section: 'Lipids', target: null },
  { key: 'polyunsaturated_g', label: 'Polyunsaturated', unit: 'g', section: 'Lipids', target: null },
  { key: 'omega3_g', label: 'Omega-3', unit: 'g', section: 'Lipids', target: { type: 'rda', male: 1.6, female: 1.1 } },
  { key: 'ala_mg', label: 'ALA', unit: 'mg', section: 'Lipids', target: null },
  { key: 'dha_mg', label: 'DHA', unit: 'mg', section: 'Lipids', target: null },
  { key: 'epa_mg', label: 'EPA', unit: 'mg', section: 'Lipids', target: null },
  { key: 'omega6_g', label: 'Omega-6', unit: 'g', section: 'Lipids', target: { type: 'rda', male: 17, female: 12 } },
  { key: 'aa_mg', label: 'AA', unit: 'mg', section: 'Lipids', target: null },
  { key: 'la_mg', label: 'LA', unit: 'mg', section: 'Lipids', target: null },
  { key: 'saturated_g', label: 'Saturated', unit: 'g', section: 'Lipids', target: { type: 'upper-limit', value: 20 } },
  { key: 'trans_fat_g', label: 'Trans-Fats', unit: 'g', section: 'Lipids', target: null },
  { key: 'cholesterol_mg', label: 'Cholesterol', unit: 'mg', section: 'Lipids', target: null },

  // ---------------- Protein ----------------
  { key: 'core:protein_g', label: 'Protein', unit: 'g', section: 'Protein', target: null }, // handled by macro_goals
  { key: 'cystine_g', label: 'Cystine', unit: 'g', section: 'Protein', target: null },
  { key: 'histidine_g', label: 'Histidine', unit: 'g', section: 'Protein', target: { type: 'per-kg', mgPerKg: 10 } },
  { key: 'isoleucine_g', label: 'Isoleucine', unit: 'g', section: 'Protein', target: { type: 'per-kg', mgPerKg: 20 } },
  { key: 'leucine_g', label: 'Leucine', unit: 'g', section: 'Protein', target: { type: 'per-kg', mgPerKg: 39 } },
  { key: 'lysine_g', label: 'Lysine', unit: 'g', section: 'Protein', target: { type: 'per-kg', mgPerKg: 30 } },
  { key: 'methionine_g', label: 'Methionine', unit: 'g', section: 'Protein', target: { type: 'per-kg', mgPerKg: 10.4 } },
  { key: 'phenylalanine_g', label: 'Phenylalanine', unit: 'g', section: 'Protein', target: { type: 'per-kg', mgPerKg: 17.5 } },
  { key: 'threonine_g', label: 'Threonine', unit: 'g', section: 'Protein', target: { type: 'per-kg', mgPerKg: 15 } },
  { key: 'tryptophan_g', label: 'Tryptophan', unit: 'g', section: 'Protein', target: { type: 'per-kg', mgPerKg: 4 } },
  { key: 'tyrosine_g', label: 'Tyrosine', unit: 'g', section: 'Protein', target: null },
  { key: 'valine_g', label: 'Valine', unit: 'g', section: 'Protein', target: { type: 'per-kg', mgPerKg: 26 } },

  // ---------------- Vitamins ----------------
  { key: 'vitamin_b1_mg', label: 'B1 (Thiamine)', unit: 'mg', section: 'Vitamins', target: { type: 'rda', male: 1.2, female: 1.1 } },
  { key: 'vitamin_b2_mg', label: 'B2 (Riboflavin)', unit: 'mg', section: 'Vitamins', target: { type: 'rda', male: 1.3, female: 1.1 } },
  { key: 'vitamin_b3_mg', label: 'B3 (Niacin)', unit: 'mg', section: 'Vitamins', target: { type: 'rda', male: 16, female: 14 } },
  { key: 'vitamin_b5_mg', label: 'B5 (Pantothenic Acid)', unit: 'mg', section: 'Vitamins', target: { type: 'rda', male: 5, female: 5 } },
  { key: 'vitamin_b6_mg', label: 'B6 (Pyridoxine)', unit: 'mg', section: 'Vitamins', target: { type: 'rda', male: 1.3, female: 1.3 } },
  { key: 'vitamin_b12_mcg', label: 'B12 (Cobalamin)', unit: 'mcg', section: 'Vitamins', target: { type: 'rda', male: 2.4, female: 2.4 } },
  { key: 'folate_mcg', label: 'Folate', unit: 'mcg', section: 'Vitamins', target: { type: 'rda', male: 400, female: 400 } },
  { key: 'vitamin_a_mcg', label: 'Vitamin A', unit: 'mcg', section: 'Vitamins', target: { type: 'rda', male: 900, female: 700 } },
  { key: 'vitamin_c_mg', label: 'Vitamin C', unit: 'mg', section: 'Vitamins', target: { type: 'rda', male: 90, female: 75 } },
  { key: 'vitamin_d_mcg', label: 'Vitamin D', unit: 'mcg', section: 'Vitamins', target: { type: 'rda', male: 15, female: 15 } },
  { key: 'vitamin_e_mg', label: 'Vitamin E', unit: 'mg', section: 'Vitamins', target: { type: 'rda', male: 15, female: 15 } },
  { key: 'vitamin_k_mcg', label: 'Vitamin K', unit: 'mcg', section: 'Vitamins', target: { type: 'rda', male: 120, female: 90 } },

  // ---------------- Minerals ----------------
  { key: 'calcium_mg', label: 'Calcium', unit: 'mg', section: 'Minerals', target: { type: 'rda', male: 1000, female: 1000 } },
  { key: 'copper_mg', label: 'Copper', unit: 'mg', section: 'Minerals', target: { type: 'rda', male: 0.9, female: 0.9 } },
  { key: 'iron_mg', label: 'Iron', unit: 'mg', section: 'Minerals', target: { type: 'rda', male: 8, female: 18 } },
  { key: 'magnesium_mg', label: 'Magnesium', unit: 'mg', section: 'Minerals', target: { type: 'rda', male: 400, female: 310 } },
  { key: 'manganese_mg', label: 'Manganese', unit: 'mg', section: 'Minerals', target: { type: 'rda', male: 2.3, female: 1.8 } },
  { key: 'phosphorus_mg', label: 'Phosphorus', unit: 'mg', section: 'Minerals', target: { type: 'rda', male: 700, female: 700 } },
  { key: 'potassium_mg', label: 'Potassium', unit: 'mg', section: 'Minerals', target: { type: 'rda', male: 3400, female: 2600 } },
  { key: 'selenium_mcg', label: 'Selenium', unit: 'mcg', section: 'Minerals', target: { type: 'rda', male: 55, female: 55 } },
  { key: 'core:sodium_mg', label: 'Sodium', unit: 'mg', section: 'Minerals', target: { type: 'upper-limit', value: 2300 } },
  { key: 'zinc_mg', label: 'Zinc', unit: 'mg', section: 'Minerals', target: { type: 'rda', male: 11, female: 8 } },
]

export function computeTarget(def, { sex, weightKg }) {
  const t = def.target
  if (!t) return null
  if (t.type === 'rda') return sex === 'female' ? t.female : t.male
  if (t.type === 'upper-limit') return t.value
  if (t.type === 'per-kg') return weightKg ? Math.round(((t.mgPerKg * weightKg) / 1000) * 100) / 100 : null
  return null
}

// Reads a nutrient's raw value out of a totals-shaped object: core
// macro fields live at the top level, everything else in .micronutrients.
export function readNutrientValue(def, totals) {
  if (def.key.startsWith('core:')) {
    return totals[def.key.slice(5)] || 0
  }
  if (def.derived === 'netCarbs') {
    return Math.max(0, (totals.carbs_g || 0) - (totals.fiber_g || 0))
  }
  return (totals.micronutrients && totals.micronutrients[def.key]) || 0
}
