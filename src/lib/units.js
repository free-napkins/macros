const KG_PER_LB = 0.45359237
const CM_PER_IN = 2.54
const G_PER_OZ = 28.3495

export function kgToLb(kg) {
  return kg / KG_PER_LB
}

export function lbToKg(lb) {
  return lb * KG_PER_LB
}

export function cmToIn(cm) {
  return cm / CM_PER_IN
}

export function inToCm(inches) {
  return inches * CM_PER_IN
}

export function cmToFeetInches(cm) {
  const totalIn = cmToIn(cm)
  const feet = Math.floor(totalIn / 12)
  const inches = Math.round(totalIn - feet * 12)
  return { feet, inches }
}

export function feetInchesToCm(feet, inches) {
  return inToCm((feet || 0) * 12 + (inches || 0))
}

export function gToOz(g) {
  return g / G_PER_OZ
}

export function ozToG(oz) {
  return oz * G_PER_OZ
}

export function formatWeightKg(kg, system) {
  if (kg == null) return ''
  if (system === 'imperial') return `${Math.round(kgToLb(kg) * 10) / 10} lb`
  return `${Math.round(kg * 10) / 10} kg`
}

export const WEIGHT_UNIT_LABEL = { metric: 'kg', imperial: 'lb' }
