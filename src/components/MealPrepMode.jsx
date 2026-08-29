import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Input, Button } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function emptyBatch() {
  return {
    name: '',
    dateMade: todayDate(),
    servingGrams: '',
    totalServings: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
  }
}
const emptyExtra = { fiber_g: '', sugar_g: '', sodium_mg: '' }

export default function MealPrepMode({ session, onLogged }) {
  const [batches, setBatches] = useState(null)
  const [amounts, setAmounts] = useState({})
  const [logging, setLogging] = useState(null)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyBatch)
  const [extra, setExtra] = useState(emptyExtra)
  const [showExtra, setShowExtra] = useState(false)
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
    setForm(emptyBatch())
    setExtra(emptyExtra)
    setShowExtra(false)
    setShowForm(false)
  }

  const canCreate =
    form.name.trim() &&
    parseFloat(form.servingGrams) > 0 &&
    parseFloat(form.totalServings) > 0 &&
    parseFloat(form.calories) >= 0

  async function createBatch() {
    if (!canCreate) return
    setSaving(true)
    setError(null)

    const servingGrams = parseFloat(form.servingGrams)
    const totalServings = parseFloat(form.totalServings)
    const scale = 100 / servingGrams

    const { data: foodRows, error: foodError } = await supabase
      .from('foods')
      .insert({
        name: form.name.trim(),
        source: 'meal_prep',
        is_permanent: false,
        calories: (parseFloat(form.calories) || 0) * scale,
        protein_g: (parseFloat(form.protein_g) || 0) * scale,
        carbs_g: (parseFloat(form.carbs_g) || 0) * scale,
        fat_g: (parseFloat(form.fat_g) || 0) * scale,
        fiber_g: (parseFloat(extra.fiber_g) || 0) * scale,
        sugar_g: (parseFloat(extra.sugar_g) || 0) * scale,
        sodium_mg: (parseFloat(extra.sodium_mg) || 0) * scale,
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
      name: form.name.trim(),
      date_made: form.dateMade,
      serving_grams: servingGrams,
      total_servings: totalServings,
      remaining_servings: totalServings,
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
                alignItems: 'flex-end',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ flex: 1 }}>
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
          <Input
            label="Batch name"
            name="mealprep-name"
            placeholder="e.g. chicken & rice meal prep"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Input
              label="Weight per serving (g)"
              name="mealprep-serving-grams"
              type="number"
              min="0"
              value={form.servingGrams}
              onChange={(e) => setForm((f) => ({ ...f, servingGrams: e.target.value }))}
            />
            <Input
              label="Number of servings"
              name="mealprep-total-servings"
              type="number"
              min="0"
              value={form.totalServings}
              onChange={(e) => setForm((f) => ({ ...f, totalServings: e.target.value }))}
            />
            <Input
              label="Date made"
              name="mealprep-date"
              type="date"
              value={form.dateMade}
              onChange={(e) => setForm((f) => ({ ...f, dateMade: e.target.value }))}
            />
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            Macros per serving:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Input
              label="Calories"
              name="mealprep-calories"
              type="number"
              value={form.calories}
              onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
            />
            <Input
              label="Protein g"
              name="mealprep-protein"
              type="number"
              value={form.protein_g}
              onChange={(e) => setForm((f) => ({ ...f, protein_g: e.target.value }))}
            />
            <Input
              label="Carbs g"
              name="mealprep-carbs"
              type="number"
              value={form.carbs_g}
              onChange={(e) => setForm((f) => ({ ...f, carbs_g: e.target.value }))}
            />
            <Input
              label="Fat g"
              name="mealprep-fat"
              type="number"
              value={form.fat_g}
              onChange={(e) => setForm((f) => ({ ...f, fat_g: e.target.value }))}
            />
          </div>

          {!showExtra && (
            <Button variant="ghost" onClick={() => setShowExtra(true)}>
              + More nutrients (optional)
            </Button>
          )}
          {showExtra && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <Input
                label="Fiber g"
                name="mealprep-fiber"
                type="number"
                value={extra.fiber_g}
                onChange={(e) => setExtra((f) => ({ ...f, fiber_g: e.target.value }))}
              />
              <Input
                label="Sugar g"
                name="mealprep-sugar"
                type="number"
                value={extra.sugar_g}
                onChange={(e) => setExtra((f) => ({ ...f, sugar_g: e.target.value }))}
              />
              <Input
                label="Sodium mg"
                name="mealprep-sodium"
                type="number"
                value={extra.sodium_mg}
                onChange={(e) => setExtra((f) => ({ ...f, sodium_mg: e.target.value }))}
              />
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
