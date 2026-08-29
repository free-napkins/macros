import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../lib/SessionContext.jsx'
import { scanLabel } from '../lib/scanLabel.js'
import FoodSearchInput from './FoodSearchInput.jsx'
import NutrientSections from './NutrientSections.jsx'
import NutrientFieldsGrid from './NutrientFieldsGrid.jsx'
import { Card, Input, Button } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

const emptyMacros = { calories: '', protein_g: '', carbs_g: '', fat_g: '' }
const emptyExtra = { fiber_g: '', sugar_g: '', sodium_mg: '' }
const emptyVariant = { product_name: '', variant_label: '' }

const MODES = [
  { key: 'search', label: 'Search' },
  { key: 'scan', label: 'Scan label' },
]

export default function QuickAdd({ onLogged }) {
  const session = useSession()
  const [mode, setMode] = useState('search')

  return (
    <Card eyebrow="Quick add" title="Add food">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: 'fit-content' }}>
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              style={{
                padding: '6px 14px',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: mode === m.key ? 'var(--accent)' : 'transparent',
                color: mode === m.key ? 'var(--on-accent)' : 'var(--muted)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'search' ? <SearchMode session={session} onLogged={onLogged} /> : <ScanMode session={session} onLogged={onLogged} />}
      </div>
    </Card>
  )
}

function SearchMode({ session, onLogged }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestionCount, setSuggestionCount] = useState(0)
  const [selectedFood, setSelectedFood] = useState(null)
  const [grams, setGrams] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newFood, setNewFood] = useState(emptyMacros)
  const [newExtra, setNewExtra] = useState(emptyExtra)
  const [newVariant, setNewVariant] = useState(emptyVariant)
  const [showNewExtra, setShowNewExtra] = useState(false)
  const [showSelectedDetail, setShowSelectedDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleQueryChange({ query, suggestions }) {
    setSearchQuery(query)
    setSuggestionCount(suggestions.length)
  }

  function reset() {
    setSearchQuery('')
    setSuggestionCount(0)
    setSelectedFood(null)
    setGrams('')
    setShowNewForm(false)
    setNewFood(emptyMacros)
    setNewExtra(emptyExtra)
    setNewVariant(emptyVariant)
    setShowNewExtra(false)
    setShowSelectedDetail(false)
    setError(null)
  }

  async function logSelected() {
    const g = parseFloat(grams)
    if (!selectedFood || !g || g <= 0) return
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('logs')
      .insert({ user_id: session.user.id, food_id: selectedFood.id, grams: g, date: todayDate() })
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
    if (!searchQuery.trim() || !g || g <= 0) return
    setSaving(true)
    setError(null)
    const { data: foodRows, error: foodError } = await supabase
      .from('foods')
      .insert({
        name: searchQuery.trim(),
        source: 'ingredient',
        product_name: newVariant.product_name.trim() || null,
        variant_label: newVariant.variant_label.trim() || null,
        calories: parseFloat(newFood.calories) || 0,
        protein_g: parseFloat(newFood.protein_g) || 0,
        carbs_g: parseFloat(newFood.carbs_g) || 0,
        fat_g: parseFloat(newFood.fat_g) || 0,
        fiber_g: parseFloat(newExtra.fiber_g) || 0,
        sugar_g: parseFloat(newExtra.sugar_g) || 0,
        sodium_mg: parseFloat(newExtra.sodium_mg) || 0,
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
    reset()
    onLogged?.()
  }

  const canAddNew = !selectedFood && searchQuery.trim() && suggestionCount === 0

  return (
    <>
      <FoodSearchInput
        name="ingredient"
        placeholder="e.g. chicken breast"
        onSelect={(food) => {
          setSelectedFood(food)
          setShowNewForm(false)
          setShowSelectedDetail(false)
        }}
        onQueryChange={handleQueryChange}
      />

      {selectedFood && (
        <>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            Per 100g: {selectedFood.calories} cal · {selectedFood.protein_g}g protein · {selectedFood.carbs_g}g
            carbs · {selectedFood.fat_g}g fat
          </div>
          <Button variant="ghost" onClick={() => setShowSelectedDetail((v) => !v)}>
            {showSelectedDetail ? 'Hide' : 'View more'} nutrients
          </Button>
          {showSelectedDetail && <FoodDetail food={selectedFood} />}
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
          + Add "{searchQuery.trim()}" as new ingredient
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Input
              label="Group under product (optional)"
              name="product-name"
              placeholder="e.g. Kit Kat"
              value={newVariant.product_name}
              onChange={(e) => setNewVariant((v) => ({ ...v, product_name: e.target.value }))}
            />
            <Input
              label="Variant / size (optional)"
              name="variant-label"
              placeholder="e.g. King Size"
              value={newVariant.variant_label}
              onChange={(e) => setNewVariant((v) => ({ ...v, variant_label: e.target.value }))}
            />
          </div>

          {!showNewExtra && (
            <Button variant="ghost" onClick={() => setShowNewExtra(true)}>
              + More nutrients (optional)
            </Button>
          )}
          {showNewExtra && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <Input
                label="Fiber g / 100g"
                name="fiber_g"
                type="number"
                value={newExtra.fiber_g}
                onChange={(e) => setNewExtra((f) => ({ ...f, fiber_g: e.target.value }))}
              />
              <Input
                label="Sugar g / 100g"
                name="sugar_g"
                type="number"
                value={newExtra.sugar_g}
                onChange={(e) => setNewExtra((f) => ({ ...f, sugar_g: e.target.value }))}
              />
              <Input
                label="Sodium mg / 100g"
                name="sodium_mg"
                type="number"
                value={newExtra.sodium_mg}
                onChange={(e) => setNewExtra((f) => ({ ...f, sodium_mg: e.target.value }))}
              />
            </div>
          )}

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
    </>
  )
}

function ScanMode({ session, onLogged }) {
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
        product_name: '',
        variant_label: '',
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
      .insert({ user_id: session.user.id, food_id: foodRows[0].id, grams: effectiveGrams, date: todayDate() })
    setSaving(false)
    if (logError) {
      setError(logError.message)
      return
    }
    reset()
    onLogged?.()
  }

  return (
    <>
      {!fields && (
        <label className="dk-btn dk-btn--ghost" style={{ display: 'inline-flex', cursor: 'pointer', width: 'fit-content' }}>
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
          <NutrientFieldsGrid fields={fields} onChange={updateField} namePrefix="label" />

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
    </>
  )
}

function FoodDetail({ food }) {
  return (
    <div style={{ padding: 'var(--space-3)', background: 'var(--card)', borderRadius: 'var(--radius-sm)' }}>
      <NutrientSections totals={food} mode="values" />
    </div>
  )
}
