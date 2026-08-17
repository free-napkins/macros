import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, Input, Button } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

const emptyMacros = { calories: '', protein_g: '', carbs_g: '', fat_g: '' }

export default function QuickAddIngredient({ onLogged }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedFood, setSelectedFood] = useState(null)
  const [grams, setGrams] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newFood, setNewFood] = useState(emptyMacros)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setSelectedFood(null)
    setShowNewForm(false)
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('source', 'ingredient')
        .ilike('name', `%${query.trim()}%`)
        .limit(5)
      if (cancelled) return
      if (!error) setSuggestions(data)
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  function pickFood(food) {
    setSelectedFood(food)
    setQuery(food.name)
    setSuggestions([])
  }

  function reset() {
    setQuery('')
    setSelectedFood(null)
    setGrams('')
    setShowNewForm(false)
    setNewFood(emptyMacros)
    setError(null)
  }

  async function logSelected() {
    const g = parseFloat(grams)
    if (!selectedFood || !g || g <= 0) return
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('logs')
      .insert({ food_id: selectedFood.id, grams: g, date: todayDate() })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    reset()
    onLogged?.()
  }

  async function saveNewAndLog() {
    const g = parseFloat(grams)
    if (!query.trim() || !g || g <= 0) return
    setSaving(true)
    setError(null)
    const { data: foodRows, error: foodError } = await supabase
      .from('foods')
      .insert({
        name: query.trim(),
        source: 'ingredient',
        calories: parseFloat(newFood.calories) || 0,
        protein_g: parseFloat(newFood.protein_g) || 0,
        carbs_g: parseFloat(newFood.carbs_g) || 0,
        fat_g: parseFloat(newFood.fat_g) || 0,
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

  const canAddNew = !selectedFood && query.trim() && suggestions.length === 0

  return (
    <Card eyebrow="Quick add" title="Weigh ingredient">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <Input
            label="Ingredient"
            name="ingredient"
            placeholder="e.g. chicken breast"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {suggestions.length > 0 && (
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                marginTop: 'var(--space-2)',
                overflow: 'hidden',
              }}
            >
              {suggestions.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => pickFood(f)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--card)',
                    border: 'none',
                    color: 'var(--fg)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {f.name} <span style={{ color: 'var(--muted)' }}>· {f.calories} cal/100g</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedFood && (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Per 100g: {selectedFood.calories} cal · {selectedFood.protein_g}g protein · {selectedFood.carbs_g}g
              carbs · {selectedFood.fat_g}g fat
            </div>
            <Input
              label="Grams eaten"
              name="grams-selected"
              type="number"
              min="0"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
            <Button onClick={logSelected} disabled={saving || !grams}>
              Log it
            </Button>
          </>
        )}

        {canAddNew && !showNewForm && (
          <Button variant="ghost" onClick={() => setShowNewForm(true)}>
            + Add "{query.trim()}" as new ingredient
          </Button>
        )}

        {canAddNew && showNewForm && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <Input
                label="Calories / 100g"
                name="calories"
                type="number"
                value={newFood.calories}
                onChange={(e) => setNewFood((f) => ({ ...f, calories: e.target.value }))}
              />
              <Input
                label="Protein g / 100g"
                name="protein_g"
                type="number"
                value={newFood.protein_g}
                onChange={(e) => setNewFood((f) => ({ ...f, protein_g: e.target.value }))}
              />
              <Input
                label="Carbs g / 100g"
                name="carbs_g"
                type="number"
                value={newFood.carbs_g}
                onChange={(e) => setNewFood((f) => ({ ...f, carbs_g: e.target.value }))}
              />
              <Input
                label="Fat g / 100g"
                name="fat_g"
                type="number"
                value={newFood.fat_g}
                onChange={(e) => setNewFood((f) => ({ ...f, fat_g: e.target.value }))}
              />
            </div>
            <Input
              label="Grams eaten"
              name="grams-new"
              type="number"
              min="0"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
            <Button onClick={saveNewAndLog} disabled={saving || !grams}>
              Save &amp; log
            </Button>
          </>
        )}

        {error && <span className="dk-field__error">{error}</span>}
      </div>
    </Card>
  )
}
