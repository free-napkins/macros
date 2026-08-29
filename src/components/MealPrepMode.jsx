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
  return { name: '', dateMade: todayDate(), totalServings: '' }
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
    setBatches(data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  function resetForm() {
    setInfo(emptyBatchInfo())
    setRows([newRow()])
    setShowForm(false)
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

    const { error: batchError } = await supabase.from('meal_preps').insert({
      user_id: session.user.id,
      food_id: foodRows[0].id,
      name: info.name.trim(),
      date_made: info.dateMade,
      serving_grams: totalGrams / portions,
      total_servings: portions,
      remaining_servings: portions,
    })
    setSaving(false)
    if (batchError) {
      setError(batchError.message)
      return
    }
    resetForm()
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
                  placeholder="1"
                  value={amounts[batch.id] ?? '1'}
                  onChange={(e) => setAmounts((a) => ({ ...a, [batch.id]: e.target.value }))}
                />
              </div>
              <Button onClick={() => logServings(batch)} disabled={logging === batch.id}>
                Log
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
            <Input
              label="Batch name"
              name="mealprep-name"
              placeholder="e.g. chicken & rice meal prep"
              value={info.name}
              onChange={(e) => setInfo((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              label="Number of portions"
              name="mealprep-total-servings"
              type="number"
              min="0"
              value={info.totalServings}
              onChange={(e) => setInfo((f) => ({ ...f, totalServings: e.target.value }))}
            />
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
              <div key={row.key} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                <div style={{ flex: '2 1 200px' }}>
                  <FoodSearchInput
                    name={`mealprep-food-${row.key}`}
                    placeholder="Ingredient in this batch"
                    onSelect={(food) => updateRow(row.key, { food })}
                  />
                </div>
                <div style={{ flex: '1 1 100px' }}>
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

          <Button onClick={createBatch} disabled={saving || !canCreate}>
            Save batch
          </Button>
        </>
      )}

      {error && <span className="dk-field__error">{error}</span>}
    </>
  )
}
