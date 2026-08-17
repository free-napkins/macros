const EMPTY = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }

export function foodContribution(food, grams) {
  const factor = grams / 100
  return {
    calories: food.calories * factor,
    protein_g: food.protein_g * factor,
    carbs_g: food.carbs_g * factor,
    fat_g: food.fat_g * factor,
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
  }
}

export function logContribution(log) {
  if (log.foods) return foodContribution(log.foods, log.grams)
  if (log.recipes) return recipeContribution(log.recipes, log.grams)
  return { ...EMPTY }
}

export function sumContributions(contributions) {
  return contributions.reduce((acc, c) => ({
    calories: acc.calories + c.calories,
    protein_g: acc.protein_g + c.protein_g,
    carbs_g: acc.carbs_g + c.carbs_g,
    fat_g: acc.fat_g + c.fat_g,
  }), { ...EMPTY })
}
