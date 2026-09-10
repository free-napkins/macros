import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Input, Button } from '../design-kit.tsx'
import FoodSearchInput from './FoodSearchInput.jsx'
import { recipeTotals } from '../lib/macroMath.js'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

let rowKey = 0
function newRow() {
  return { key: rowKey++, food: null, grams: '' }
}

function emptyBatchInfo() {
  return { name: '', dateMade: todayDate(), totalServings: '', remainingServings: '' }
}

export default function MealPrepMode({ session, onLogged }) {
  const [batches, setBatches] = useState(null)
  const [amounts, setAmounts] = useState({})
  const [logging, setLogging] = useState(null)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [info, setInfo] = useState(emptyBatchInfo)
  const [rows, setRows] = useState([newRow()])
  const [saving, setSaving] = useState(false)
  const [editingBatch, setEditingBatch] = useState(null)

  async function load() {
    if (!session) return
    const { data, error } = await supabase
      .from('meal_preps')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })
    if (error) {
      setError(error.message)
      return
    }
    const { data: ingredientRows, error: ingredientError } = data.length === 0
      ? { data: [], error: null }
      : await supabase
        .from('meal_prep_ingredients')
        .select('meal_prep_id, grams, foods(*)')
        .in('meal_prep_id', data.map((batch) => batch.id))
    if (ingredientError && ingredientError.code !== '42P01') {
      setError(ingredientError.message)
      return
    }
    const ingredientsByBatch = (ingredientRows || []).reduce((grouped, row) => {
      grouped[row.meal_prep_id] = [...(grouped[row.meal_prep_id] || []), row]
      return grouped
    }, {})
    setBatches(data.map((batch) => ({ ...batch, ingredients: ingredientsByBatch[batch.id] || [] })))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  function resetForm() {
    setInfo(emptyBatchInfo())
    setRows([newRow()])
    setShowForm(false)
    setEditingBatch(null)
  }

  function editBatch(batch) {
    setEditingBatch(batch.id)
    setShowForm(true)
    setInfo({
      name: batch.name,
      dateMade: batch.date_made,
      totalServings: String(batch.total_servings),
      remainingServings: String(batch.remaining_servings),
    })
    setRows(batch.ingredients.length > 0
      ? batch.ingredients.map((ingredient) => ({ key: rowKey++, food: ingredient.foods, grams: String(ingredient.grams) }))
      : [newRow()])
    setError(null)
  }

  function updateRow(key, patch) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function removeRow(key) {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs))
  }

  const validRows = rows.filter((r) => r.food && parseFloat(r.grams) > 0)
  const totalGrams = validRows.reduce((sum, r) => sum + parseFloat(r.grams), 0)
  const portions = parseFloat(info.totalServings)

  const previewTotals =
    validRows.length > 0
      ? recipeTotals({ recipe_ingredients: validRows.map((r) => ({ foods: r.food, grams: parseFloat(r.grams) })) })
      : null

  const canCreate = info.name.trim() && validRows.length > 0 && portions > 0

  async function createBatch() {
    if (!canCreate) return
    setSaving(true)
    setError(null)

    const scale = 100 / totalGrams
    const { data: foodRows, error: foodError } = await supabase
      .from('foods')
      .insert({
        name: info.name.trim(),
        source: 'meal_prep',
        is_permanent: false,
        calories: previewTotals.calories * scale,
        protein_g: previewTotals.protein_g * scale,
        carbs_g: previewTotals.carbs_g * scale,
        fat_g: previewTotals.fat_g * scale,
        fiber_g: previewTotals.fiber_g * scale,
        sugar_g: previewTotals.sugar_g * scale,
        sodium_mg: previewTotals.sodium_mg * scale,
      })
      .select()
    if (foodError) {
      setSaving(false)
      setError(foodError.message)
      return
    }

    const { data: batchRows, error: batchError } = await supabase.from('meal_preps').insert({
      user_id: session.user.id,
      food_id: foodRows[0].id,
      name: info.name.trim(),
      date_made: info.dateMade,
      serving_grams: totalGrams / portions,
      total_servings: portions,
      remaining_servings: portions,
    }).select('id')
    setSaving(false)
    if (batchError) {
      setError(batchError.message)
      return
    }
    const batchId = batchRows?.[0]?.id
    if (batchId) {
      await supabase.from('meal_prep_ingredients').insert(
        validRows.map((row) => ({ meal_prep_id: batchId, food_id: row.food.id, grams: parseFloat(row.grams) }))
      )
    }
    resetForm()
    load()
  }

  async function updateBatch() {
    const batch = batches.find((item) => item.id === editingBatch)
    if (!batch) return
    const totalServings = parseFloat(info.totalServings)
    const remainingServings = parseFloat(info.remainingServings)
    if (!info.name.trim() || !totalServings || remainingServings < 0 || remainingServings > totalServings) return
    setSaving(true)
    setError(null)

    const update = {
      name: info.name.trim(),
      date_made: info.dateMade,
      total_servings: totalServings,
      remaining_servings: remainingServings,
    }
    if (validRows.length > 0) {
      const totalGrams = validRows.reduce((sum, row) => sum + parseFloat(row.grams), 0)
      const totals = recipeTotals({ recipe_ingredients: validRows.map((row) => ({ foods: row.food, grams: parseFloat(row.grams) })) })
      const scale = 100 / totalGrams
      const { error: foodError } = await supabase.from('foods').update({
        name: info.name.trim(),
        calories: totals.calories * scale,
        protein_g: totals.protein_g * scale,
        carbs_g: totals.carbs_g * scale,
        fat_g: totals.fat_g * scale,
        fiber_g: totals.fiber_g * scale,
        sugar_g: totals.sugar_g * scale,
        sodium_mg: totals.sodium_mg * scale,
      }).eq('id', batch.food_id)
      if (foodError) {
        setSaving(false)
        setError(foodError.message)
        return
      }
      update.serving_grams = totalGrams / totalServings
      await supabase.from('meal_prep_ingredients').delete().eq('meal_prep_id', batch.id)
      const { error: ingredientsError } = await supabase.from('meal_prep_ingredients').insert(
        validRows.map((row) => ({ meal_prep_id: batch.id, food_id: row.food.id, grams: parseFloat(row.grams) }))
      )
      if (ingredientsError) {
        setSaving(false)
        setError(ingredientsError.message)
        return
      }
    }
    const { error: batchError } = await supabase.from('meal_preps').update(update).eq('id', batch.id)
    setSaving(false)
    if (batchError) {
      setError(batchError.message)
      return
    }
    resetForm()
    load()
  }

  async function deleteBatch() {
    const batch = batches.find((item) => item.id === editingBatch)
    if (!batch || !window.confirm(`Delete ${batch.name}? Existing food logs will be kept.`)) return
    setSaving(true)
    setError(null)
    const { error: deleteError } = await supabase.from('meal_preps').delete().eq('id', batch.id)
    setSaving(false)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    resetForm()
    onLogged?.()
    load()
  }

  async function logServings(batch) {
    const amount = parseFloat(amounts[batch.id])
    if (!amount || amount <= 0) return
    setLogging(batch.id)
    setError(null)

    // Log first, then decrement/delete the tracker: if the log insert
    // fails nothing else happens (safe retry); if the follow-up update
    // fails instead, today's macros are still correctly recorded and
    // only the remaining-count display is left stale — the reverse
    // order risks silently losing a nutrition entry with no recovery
    // path, since a fully-consumed batch's food row isn't searchable.
    const { error: logError } = await supabase
      .from('logs')
      .insert({ user_id: session.user.id, food_id: batch.food_id, grams: batch.serving_grams * amount, date: todayDate() })
    if (logError) {
      setLogging(null)
      setError(logError.message)
      return
    }

    const newRemaining = batch.remaining_servings - amount
    if (newRemaining <= 0) {
      await supabase.from('meal_preps').delete().eq('id', batch.id)
    } else {
      await supabase.from('meal_preps').update({ remaining_servings: newRemaining }).eq('id', batch.id)
    }

    setLogging(null)
    setAmounts((a) => ({ ...a, [batch.id]: '' }))
    onLogged?.()
    load()
  }

  return (
    <>
      {batches === null ? (
        <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>
      ) : (
        <>
          {batches.length === 0 && (
            <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>No active batches yet.</div>
          )}
          {batches.map((batch) => (
            <div
              key={batch.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ flex: '1 1 160px' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{batch.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  {batch.remaining_servings}/{batch.total_servings} left · made {batch.date_made}
                </div>
              </div>
              <div style={{ width: '80px' }}>
                <Input
                  name={`servings-${batch.id}`}
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Servings"
                  value={amounts[batch.id] ?? ''}
                  onChange={(e) => setAmounts((a) => ({ ...a, [batch.id]: e.target.value }))}
                />
              </div>
              <Button onClick={() => logServings(batch)} disabled={logging === batch.id}>
                Log
              </Button>
              <Button variant="ghost" onClick={() => editBatch(batch)} disabled={logging === batch.id}>
                Edit
              </Button>
            </div>
          ))}
        </>
      )}

      {!showForm && (
        <Button variant="ghost" onClick={() => setShowForm(true)}>
          + Log a new batch
        </Button>
      )}

      {showForm && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 'var(--space-3)', minWidth: 0 }}>
            <Input
              label="Batch name"
              name="mealprep-name"
              placeholder="e.g. chicken & rice meal prep"
              value={info.name}
              onChange={(e) => setInfo((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              label="Total portions"
              name="mealprep-total-servings"
              type="number"
              min="0"
              value={info.totalServings}
              onChange={(e) => setInfo((f) => ({ ...f, totalServings: e.target.value }))}
            />
            {editingBatch && (
              <Input
                label="Servings left"
                name="mealprep-remaining-servings"
                type="number"
                min="0"
                step="0.5"
                value={info.remainingServings}
                onChange={(e) => setInfo((f) => ({ ...f, remainingServings: e.target.value }))}
              />
            )}
            <Input
              label="Date made"
              name="mealprep-date"
              type="date"
              value={info.dateMade}
              onChange={(e) => setInfo((f) => ({ ...f, dateMade: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {rows.map((row) => (
              <div key={row.key} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(100px, 1fr) auto', gap: 'var(--space-2)', alignItems: 'start', minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <FoodSearchInput
                    name={`mealprep-food-${row.key}`}
                    placeholder="Ingredient in this batch"
                    onSelect={(food) => updateRow(row.key, { food })}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <Input
                    name={`mealprep-grams-${row.key}`}
                    type="number"
                    min="0"
                    placeholder="Grams"
                    value={row.grams}
                    onChange={(e) => updateRow(row.key, { grams: e.target.value })}
                  />
                </div>
                <Button variant="ghost" onClick={() => removeRow(row.key)} aria-label="Remove ingredient">
                  ×
                </Button>
              </div>
            ))}
          </div>

          <Button variant="ghost" onClick={() => setRows((rs) => [...rs, newRow()])}>
            + Add ingredient
          </Button>

          {previewTotals && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Batch total {totalGrams}g · {Math.round(previewTotals.calories)} cal · {Math.round(previewTotals.protein_g)}g
              protein · {Math.round(previewTotals.carbs_g)}g carbs · {Math.round(previewTotals.fat_g)}g fat
              {portions > 0 && (
                <>
                  <br />
                  Per portion ({Math.round(totalGrams / portions)}g): {Math.round(previewTotals.calories / portions)} cal ·{' '}
                  {Math.round(previewTotals.protein_g / portions)}g protein · {Math.round(previewTotals.carbs_g / portions)}g
                  carbs · {Math.round(previewTotals.fat_g / portions)}g fat
                </>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <Button onClick={editingBatch ? updateBatch : createBatch} disabled={saving || (editingBatch ? !info.name.trim() : !canCreate)}>
              {editingBatch ? 'Save changes' : 'Save batch'}
            </Button>
            {editingBatch && (
              <Button variant="ghost" onClick={deleteBatch} disabled={saving}>
                Delete meal plan
              </Button>
            )}
          </div>
        </>
      )}

      {error && <span className="dk-field__error">{error}</span>}
    </>
  )
}
