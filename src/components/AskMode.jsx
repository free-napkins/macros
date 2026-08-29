import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { analyzeFood } from '../lib/analyzeFood.js'
import NutrientFieldsGrid from './NutrientFieldsGrid.jsx'
import { Textarea, Input, Button } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function AskMode({ session, onLogged }) {
  const [description, setDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [fields, setFields] = useState(null)
  const [grams, setGrams] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [loggedFood, setLoggedFood] = useState(null) // { id, name } once logged, awaiting permanent choice

  async function handleAnalyze() {
    if (!description.trim()) return
    setAnalyzing(true)
    setError(null)
    try {
      const result = await analyzeFood(description.trim())
      const quantity = result.quantity ?? null
      const servingSizeG = result.serving_size_g || null
      setFields({
        name: result.name || '',
        product_name: '',
        variant_label: '',
        calories: result.calories ?? 0,
        protein_g: result.protein_g ?? 0,
        carbs_g: result.carbs_g ?? 0,
        fat_g: result.fat_g ?? 0,
        fiber_g: result.fiber_g ?? 0,
        sugar_g: result.sugar_g ?? 0,
        sodium_mg: result.sodium_mg ?? 0,
        serving_size_g: servingSizeG,
        serving_label: result.serving_label || '',
        micronutrients: result.micronutrients || {},
      })
      setGrams(quantity && servingSizeG ? String(Math.round(quantity * servingSizeG)) : '')
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  function updateField(key, value) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  function resetAll() {
    setDescription('')
    setFields(null)
    setGrams('')
    setLoggedFood(null)
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
        source: 'ask',
        is_permanent: false,
        product_name: fields.product_name.trim() || null,
        variant_label: fields.variant_label.trim() || null,
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
      .insert({ user_id: session.user.id, food_id: foodRows[0].id, grams: g, date: todayDate() })
    setSaving(false)
    if (logError) {
      setError(logError.message)
      return
    }
    onLogged?.()
    setLoggedFood({ id: foodRows[0].id, name: fields.name.trim() })
  }

  async function choosePermanent(makePermanent) {
    if (makePermanent && loggedFood) {
      await supabase.from('foods').update({ is_permanent: true }).eq('id', loggedFood.id)
    }
    resetAll()
  }

  if (loggedFood) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ fontSize: 'var(--text-sm)' }}>Logged "{loggedFood.name}".</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-strong)' }}>
          Save it as a reusable ingredient for next time?
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button onClick={() => choosePermanent(true)}>Yes, save it</Button>
          <Button variant="ghost" onClick={() => choosePermanent(false)}>
            No, just this once
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Textarea
        label="Describe what you ate or want to define"
        name="ask-description"
        placeholder='e.g. "white rice cooked in chicken stock" or "I ate 4 smores tonight, graham cracker, marshmallow, and a square of chocolate each"'
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {!fields && (
        <Button onClick={handleAnalyze} disabled={analyzing || !description.trim()}>
          {analyzing ? 'Analyzing…' : 'Analyze'}
        </Button>
      )}

      {fields && (
        <>
          <NutrientFieldsGrid fields={fields} onChange={updateField} namePrefix="ask" />
          <Input
            label="Grams eaten"
            name="ask-grams"
            type="number"
            min="0"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button onClick={saveAndLog} disabled={saving || !grams}>
              Log it
            </Button>
            <Button variant="ghost" onClick={resetAll} disabled={saving}>
              Start over
            </Button>
          </div>
        </>
      )}

      {error && <span className="dk-field__error">{error}</span>}
    </>
  )
}
