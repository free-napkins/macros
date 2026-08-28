import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../lib/SessionContext.jsx'
import { Card, Input, Button } from '../design-kit.tsx'
import FoodSearchInput from './FoodSearchInput.jsx'
import { recipeTotals } from '../lib/macroMath.js'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

let rowKey = 0
function newRow() {
  return { key: rowKey++, food: null, grams: '' }
}

export default function QuickAddRecipe({ onLogged }) {
  const session = useSession()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [grams, setGrams] = useState('')
  const [showBuilder, setShowBuilder] = useState(false)
  const [rows, setRows] = useState([newRow()])
  const [gramsNow, setGramsNow] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const skipNextSearch = useRef(false)

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false
      return
    }
    setSelectedRecipe(null)
    setShowBuilder(false)
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    if (!session) return
    let cancelled = false
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', session.user.id)
        .ilike('name', `%${query.trim()}%`)
        .limit(5)
      if (cancelled) return
      if (!error) setSuggestions(data)
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, session])

  function pickRecipe(recipe) {
    skipNextSearch.current = true
    setSelectedRecipe(recipe)
    setQuery(recipe.name)
    setSuggestions([])
  }

  function reset() {
    setQuery('')
    setSelectedRecipe(null)
    setGrams('')
    setShowBuilder(false)
    setRows([newRow()])
    setGramsNow('')
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

  const previewTotals =
    validRows.length > 0
      ? recipeTotals({
          recipe_ingredients: validRows.map((r) => ({ foods: r.food, grams: parseFloat(r.grams) })),
        })
      : null

  async function logSelectedRecipe() {
    const g = parseFloat(grams)
    if (!selectedRecipe || !g || g <= 0) return
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('logs')
      .insert({ user_id: session.user.id, recipe_id: selectedRecipe.id, grams: g, date: todayDate() })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    reset()
    onLogged?.()
  }

  async function saveRecipe() {
    if (!query.trim() || validRows.length === 0) return
    setSaving(true)
    setError(null)

    const { data: recipeRows, error: recipeError } = await supabase
      .from('recipes')
      .insert({ user_id: session.user.id, name: query.trim(), total_grams: totalGrams })
      .select()
    if (recipeError) {
      setSaving(false)
      setError(recipeError.message)
      return
    }
    const recipe = recipeRows[0]

    const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(
      validRows.map((r) => ({ recipe_id: recipe.id, food_id: r.food.id, grams: parseFloat(r.grams) }))
    )
    if (ingredientsError) {
      setSaving(false)
      setError(ingredientsError.message)
      return
    }

    const g = parseFloat(gramsNow)
    if (g > 0) {
      const { error: logError } = await supabase
        .from('logs')
        .insert({ user_id: session.user.id, recipe_id: recipe.id, grams: g, date: todayDate() })
      if (logError) {
        setSaving(false)
        setError(logError.message)
        return
      }
      onLogged?.()
    }

    setSaving(false)
    reset()
  }

  const canBuildNew = !selectedRecipe && query.trim() && suggestions.length === 0

  return (
    <Card eyebrow="Quick add" title="Log recipe">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <Input
            label="Recipe"
            name="recipe"
            placeholder="e.g. chicken stir fry"
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
              {suggestions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => pickRecipe(r)}
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
                  {r.name} <span style={{ color: 'var(--muted)' }}>· {r.total_grams}g total</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedRecipe && (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Whole recipe: {selectedRecipe.total_grams}g
            </div>
            <Input
              label="Grams eaten"
              name="recipe-grams-selected"
              type="number"
              min="0"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
            <Button onClick={logSelectedRecipe} disabled={saving || !grams}>
              Log it
            </Button>
          </>
        )}

        {canBuildNew && !showBuilder && (
          <Button variant="ghost" onClick={() => setShowBuilder(true)}>
            + Build "{query.trim()}" as new recipe
          </Button>
        )}

        {canBuildNew && showBuilder && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {rows.map((row) => (
                <div key={row.key} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                  <div style={{ flex: 2 }}>
                    <FoodSearchInput
                      name={`row-food-${row.key}`}
                      placeholder="Ingredient in this recipe"
                      onSelect={(food) => updateRow(row.key, { food })}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input
                      name={`row-grams-${row.key}`}
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
                Total {totalGrams}g · {Math.round(previewTotals.calories)} cal · {Math.round(previewTotals.protein_g)}g
                protein · {Math.round(previewTotals.carbs_g)}g carbs · {Math.round(previewTotals.fat_g)}g fat
              </div>
            )}

            <Input
              label="Grams eaten now (optional)"
              name="recipe-grams-now"
              type="number"
              min="0"
              value={gramsNow}
              onChange={(e) => setGramsNow(e.target.value)}
            />

            <Button onClick={saveRecipe} disabled={saving || validRows.length === 0}>
              Save recipe{gramsNow ? ' & log' : ''}
            </Button>
          </>
        )}

        {error && <span className="dk-field__error">{error}</span>}
      </div>
    </Card>
  )
}
