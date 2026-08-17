export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const KCAL_PER_KG = 7700
const MIN_SAFE_CALORIES = 1200

export function calculateAge(birthDateStr, today = new Date()) {
  const birth = new Date(birthDateStr)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function calculateBMR({ sex, age, heightCm, weightKg }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

export function calculateTDEE(bmr, activityLevel) {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel]
}

export function calorieAdjustmentForGoal(goalType, rateKgPerWeek) {
  const dailyKcalPerKg = KCAL_PER_KG / 7
  if (goalType === 'lose') return -rateKgPerWeek * dailyKcalPerKg
  if (goalType === 'gain') return rateKgPerWeek * dailyKcalPerKg
  return 0
}

// Split a calorie target into macros: protein by bodyweight (spares
// muscle in a deficit), fat as a fixed share of calories, carbs fill
// the remainder.
export function macrosFromCalories(calories, weightKg) {
  const protein_g = Math.round(1.8 * weightKg)
  const fat_g = Math.round((calories * 0.25) / 9)
  const carbs_g = Math.round(Math.max(0, calories - protein_g * 4 - fat_g * 9) / 4)
  return { protein_g, fat_g, carbs_g }
}

export function calculateMacroGoal({ sex, birthDate, heightCm, weightKg, activityLevel, goalType, rateKgPerWeek }) {
  const age = calculateAge(birthDate)
  const bmr = calculateBMR({ sex, age, heightCm, weightKg })
  const tdee = calculateTDEE(bmr, activityLevel)
  const adjustment = calorieAdjustmentForGoal(goalType, rateKgPerWeek)
  const calories = Math.max(MIN_SAFE_CALORIES, Math.round(tdee + adjustment))
  const macros = macrosFromCalories(calories, weightKg)

  return { bmr: Math.round(bmr), tdee: Math.round(tdee), calories, ...macros }
}
