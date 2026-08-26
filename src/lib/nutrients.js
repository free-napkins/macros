// Display metadata for the micronutrient keys used in foods.micronutrients
// and supplements.nutrients (jsonb). Order here is the display order.
export const MICRONUTRIENT_INFO = [
  { key: 'vitamin_a_mcg', label: 'Vitamin A', unit: 'mcg' },
  { key: 'vitamin_c_mg', label: 'Vitamin C', unit: 'mg' },
  { key: 'vitamin_d_mcg', label: 'Vitamin D', unit: 'mcg' },
  { key: 'vitamin_b12_mcg', label: 'Vitamin B12', unit: 'mcg' },
  { key: 'folate_mcg', label: 'Folate', unit: 'mcg' },
  { key: 'calcium_mg', label: 'Calcium', unit: 'mg' },
  { key: 'iron_mg', label: 'Iron', unit: 'mg' },
  { key: 'magnesium_mg', label: 'Magnesium', unit: 'mg' },
  { key: 'potassium_mg', label: 'Potassium', unit: 'mg' },
  { key: 'zinc_mg', label: 'Zinc', unit: 'mg' },
]

const INFO_BY_KEY = Object.fromEntries(MICRONUTRIENT_INFO.map((m) => [m.key, m]))

export function nutrientLabel(key) {
  return INFO_BY_KEY[key]?.label || key
}

export function nutrientUnit(key) {
  return INFO_BY_KEY[key]?.unit || ''
}

// Orders a raw {key: value} micronutrients object using MICRONUTRIENT_INFO's
// order first, then any unrecognized keys alphabetically after.
export function orderedMicronutrients(micronutrients) {
  const known = MICRONUTRIENT_INFO.filter((m) => micronutrients[m.key] != null && micronutrients[m.key] !== 0)
  const knownKeys = new Set(known.map((m) => m.key))
  const unknown = Object.keys(micronutrients)
    .filter((k) => !knownKeys.has(k) && micronutrients[k] != null && micronutrients[k] !== 0)
    .sort()
    .map((key) => ({ key, label: key, unit: '' }))
  return [...known, ...unknown]
}
