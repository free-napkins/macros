const EMPTY = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0, micronutrients: {} }

function mergeMicros(a, b, factor) {
  const out = { ...a }
  for (const [key, val] of Object.entries(b || {})) {
    out[key] = (out[key] || 0) + val * factor
  }
  return out
}

export function foodContribution(food, grams) {
  const factor = grams / 100
  return {
    calories: food.calories * factor,
    protein_g: food.protein_g * factor,
    carbs_g: food.carbs_g * factor,
    fat_g: food.fat_g * factor,
    fiber_g: (food.fiber_g || 0) * factor,
    sugar_g: (food.sugar_g || 0) * factor,
    sodium_mg: (food.sodium_mg || 0) * factor,
    micronutrients: mergeMicros({}, food.micronutrients, factor),
  }
}

export function recipeTotals(recipe) {
  return recipe.recipe_ingredients.reduce((acc, ri) => {
    const c = foodContribution(ri.foods, ri.grams)
    return {
      calories: acc.calories + c.calories,
      protein_g: acc.protein_g + c.protein_g,
      carbs_g: acc.carbs_g + c.carbs_g,
      fat_g: acc.fat_g + c.fat_g,
      fiber_g: acc.fiber_g + c.fiber_g,
      sugar_g: acc.sugar_g + c.sugar_g,
      sodium_mg: acc.sodium_mg + c.sodium_mg,
      micronutrients: mergeMicros(acc.micronutrients, c.micronutrients, 1),
    }
  }, { ...EMPTY })
}

export function recipeContribution(recipe, grams) {
  const totals = recipeTotals(recipe)
  const factor = grams / recipe.total_grams
  return {
    calories: totals.calories * factor,
    protein_g: totals.protein_g * factor,
    carbs_g: totals.carbs_g * factor,
    fat_g: totals.fat_g * factor,
    fiber_g: totals.fiber_g * factor,
    sugar_g: totals.sugar_g * factor,
    sodium_mg: totals.sodium_mg * factor,
    micronutrients: mergeMicros({}, totals.micronutrients, factor),
  }
}

export function logContribution(log) {
  if (log.foods) return foodContribution(log.foods, log.grams)
  if (log.recipes) return recipeContribution(log.recipes, log.grams)
  return { ...EMPTY, micronutrients: {} }
}

export function sumContributions(contributions) {
  return contributions.reduce((acc, c) => ({
    calories: acc.calories + c.calories,
    protein_g: acc.protein_g + c.protein_g,
    carbs_g: acc.carbs_g + c.carbs_g,
    fat_g: acc.fat_g + c.fat_g,
    fiber_g: acc.fiber_g + c.fiber_g,
    sugar_g: acc.sugar_g + c.sugar_g,
    sodium_mg: acc.sodium_mg + c.sodium_mg,
    micronutrients: mergeMicros(acc.micronutrients, c.micronutrients, 1),
  }), { ...EMPTY, micronutrients: {} })
}
