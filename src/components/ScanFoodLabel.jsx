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
  const [logMode, setLogMode] = useState('grams') // 'grams' | 'servings'
  const [grams, setGrams] = useState('')
  const [servings, setServings] = useState('')
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
        serving_size_g: result.serving_size_g || null,
        serving_label: result.serving_label || '',
        micronutrients: result.micronutrients || {},
      })
      setLogMode(result.serving_size_g ? 'servings' : 'grams')
      setServings('1')
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
    setServings('')
    setLogMode('grams')
    setError(null)
  }

  const effectiveGrams =
    logMode === 'servings' ? (parseFloat(servings) || 0) * (parseFloat(fields?.serving_size_g) || 0) : parseFloat(grams) || 0

  async function saveAndLog() {
    if (!fields?.name?.trim() || !effectiveGrams || effectiveGrams <= 0) return
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
        serving_size_g: fields.serving_size_g ? parseFloat(fields.serving_size_g) : null,
        serving_label: fields.serving_label || null,
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
      .insert({ food_id: foodRows[0].id, grams: effectiveGrams, date: todayDate() })
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
              <Input
                label="Serving size (g)"
                name="label-serving-size"
                type="number"
                placeholder="e.g. 240"
                value={fields.serving_size_g || ''}
                onChange={(e) => updateField('serving_size_g', e.target.value)}
              />
            </div>
            {microCount > 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                + {microCount} other nutrient{microCount === 1 ? '' : 's'} detected
              </div>
            )}

            {fields.serving_size_g > 0 && (
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: 'fit-content' }}>
                {['servings', 'grams'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setLogMode(m)}
                    style={{
                      padding: '6px 14px',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: logMode === m ? 'var(--accent)' : 'transparent',
                      color: logMode === m ? 'var(--on-accent)' : 'var(--muted)',
                    }}
                  >
                    {m === 'servings' ? 'By serving' : 'By grams'}
                  </button>
                ))}
              </div>
            )}

            {logMode === 'servings' && fields.serving_size_g > 0 ? (
              <Input
                label={`Servings eaten${fields.serving_label ? ` (1 = ${fields.serving_label})` : ''}`}
                name="label-servings"
                type="number"
                min="0"
                step="0.25"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            ) : (
              <Input
                label="Grams eaten"
                name="label-grams"
                type="number"
                min="0"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
              />
            )}
            {logMode === 'servings' && effectiveGrams > 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                = {Math.round(effectiveGrams)}g
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button onClick={saveAndLog} disabled={saving || !effectiveGrams}>
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
