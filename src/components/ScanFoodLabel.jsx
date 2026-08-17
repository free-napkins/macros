import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { scanLabel } from '../lib/scanLabel.js'
import { Card, Input, Button } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function ScanFoodLabel({ onLogged }) {
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState(null)
  const [fields, setFields] = useState(null)
  const [grams, setGrams] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setParsing(true)
    setError(null)
    try {
      const result = await scanLabel(file, 'food')
      setFields({
        name: result.name || '',
        calories: result.calories ?? 0,
        protein_g: result.protein_g ?? 0,
        carbs_g: result.carbs_g ?? 0,
        fat_g: result.fat_g ?? 0,
        fiber_g: result.fiber_g ?? 0,
        sugar_g: result.sugar_g ?? 0,
        sodium_mg: result.sodium_mg ?? 0,
        micronutrients: result.micronutrients || {},
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setParsing(false)
    }
  }

  function updateField(key, value) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  function reset() {
    setFields(null)
    setGrams('')
    setError(null)
  }

  async function saveAndLog() {
    const g = parseFloat(grams)
    if (!fields?.name?.trim() || !g || g <= 0) return
    setSaving(true)
    setError(null)
    const { data: foodRows, error: foodError } = await supabase
      .from('foods')
      .insert({
        name: fields.name.trim(),
        source: 'label',
        calories: parseFloat(fields.calories) || 0,
        protein_g: parseFloat(fields.protein_g) || 0,
        carbs_g: parseFloat(fields.carbs_g) || 0,
        fat_g: parseFloat(fields.fat_g) || 0,
        fiber_g: parseFloat(fields.fiber_g) || 0,
        sugar_g: parseFloat(fields.sugar_g) || 0,
        sodium_mg: parseFloat(fields.sodium_mg) || 0,
        micronutrients: fields.micronutrients || {},
      })
      .select()
    if (foodError) {
      setSaving(false)
      setError(foodError.message)
      return
    }
    const { error: logError } = await supabase
      .from('logs')
      .insert({ food_id: foodRows[0].id, grams: g, date: todayDate() })
    setSaving(false)
    if (logError) {
      setError(logError.message)
      return
    }
    reset()
    onLogged?.()
  }

  const microCount = fields ? Object.keys(fields.micronutrients || {}).length : 0

  return (
    <Card eyebrow="Quick add" title="Scan label">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {!fields && (
          <label
            className="dk-btn dk-btn--ghost"
            style={{ display: 'inline-flex', cursor: 'pointer', width: 'fit-content' }}
          >
            {parsing ? 'Reading label…' : 'Take or choose photo'}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              disabled={parsing}
              style={{ display: 'none' }}
            />
          </label>
        )}

        {fields && (
          <>
            <Input label="Name" name="label-name" value={fields.name} onChange={(e) => updateField('name', e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <Input
                label="Calories / 100g"
                name="label-calories"
                type="number"
                value={fields.calories}
                onChange={(e) => updateField('calories', e.target.value)}
              />
              <Input
                label="Protein g / 100g"
                name="label-protein"
                type="number"
                value={fields.protein_g}
                onChange={(e) => updateField('protein_g', e.target.value)}
              />
              <Input
                label="Carbs g / 100g"
                name="label-carbs"
                type="number"
                value={fields.carbs_g}
                onChange={(e) => updateField('carbs_g', e.target.value)}
              />
              <Input
                label="Fat g / 100g"
                name="label-fat"
                type="number"
                value={fields.fat_g}
                onChange={(e) => updateField('fat_g', e.target.value)}
              />
              <Input
                label="Fiber g / 100g"
                name="label-fiber"
                type="number"
                value={fields.fiber_g}
                onChange={(e) => updateField('fiber_g', e.target.value)}
              />
              <Input
                label="Sugar g / 100g"
                name="label-sugar"
                type="number"
                value={fields.sugar_g}
                onChange={(e) => updateField('sugar_g', e.target.value)}
              />
              <Input
                label="Sodium mg / 100g"
                name="label-sodium"
                type="number"
                value={fields.sodium_mg}
                onChange={(e) => updateField('sodium_mg', e.target.value)}
              />
            </div>
            {microCount > 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                + {microCount} other nutrient{microCount === 1 ? '' : 's'} detected
              </div>
            )}
            <Input
              label="Grams eaten"
              name="label-grams"
              type="number"
              min="0"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button onClick={saveAndLog} disabled={saving || !grams}>
                Save &amp; log
              </Button>
              <Button variant="ghost" onClick={reset} disabled={saving}>
                Retake
              </Button>
            </div>
          </>
        )}

        {error && <span className="dk-field__error">{error}</span>}
      </div>
    </Card>
  )
}
