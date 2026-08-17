import { calorieAdjustmentForGoal, macrosFromCalories } from './macroCalc.js'

const KCAL_PER_KG = 7700
const MIN_SAFE_CALORIES = 1200
const MIN_ADJUSTMENT_THRESHOLD = 75 // kcal — ignore noise smaller than this

function daysBetween(dateStrA, dateStrB) {
  return Math.round((new Date(dateStrB) - new Date(dateStrA)) / 86400000)
}

// Compares actual weight trend against logged calorie intake since the
// last goal took effect to back out a real TDEE estimate, then re-derives
// the calorie target from that. Returns null if it isn't due yet or there
// isn't enough data to trust a recalculation.
export function computeAdaptiveAdjustment({
  today,
  lastGoal,
  weightEntries, // [{date, weight_kg}], any order
  caloriesByDate, // {date: totalCalories}
  goalType,
  rateKgPerWeek,
  currentWeightKg,
}) {
  const daysSinceLastGoal = daysBetween(lastGoal.effective_date, today)
  if (daysSinceLastGoal < 7) return null

  const relevantWeights = weightEntries
    .filter((w) => w.date >= lastGoal.effective_date && w.date <= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
  const relevantCalDates = Object.keys(caloriesByDate).filter(
    (d) => d >= lastGoal.effective_date && d <= today
  )

  if (relevantWeights.length < 2 || relevantCalDates.length < 4) return null

  const first = relevantWeights[0]
  const last = relevantWeights[relevantWeights.length - 1]
  const spanDays = daysBetween(first.date, last.date)
  if (spanDays < 5) return null

  const weightChangeKg = last.weight_kg - first.weight_kg
  const avgCalories =
    relevantCalDates.reduce((sum, d) => sum + caloriesByDate[d], 0) / relevantCalDates.length

  const actualTDEE = avgCalories - (weightChangeKg * KCAL_PER_KG) / spanDays
  const adjustment = calorieAdjustmentForGoal(goalType, rateKgPerWeek)
  const newCalories = Math.max(MIN_SAFE_CALORIES, Math.round(actualTDEE + adjustment))

  const delta = newCalories - lastGoal.calories
  if (Math.abs(delta) < MIN_ADJUSTMENT_THRESHOLD) return null

  const macros = macrosFromCalories(newCalories, currentWeightKg)

  return {
    calories: newCalories,
    ...macros,
    previousCalories: lastGoal.calories,
    actualTDEE: Math.round(actualTDEE),
    spanDays,
    avgCalories: Math.round(avgCalories),
    weightChangeKg,
    reason:
      `weekly_adjustment: ~${Math.round(actualTDEE)} kcal actual maintenance from ${spanDays}-day trend ` +
      `(avg intake ${Math.round(avgCalories)} kcal/day, weight change ${weightChangeKg >= 0 ? '+' : ''}${weightChangeKg.toFixed(1)}kg)`,
  }
}
