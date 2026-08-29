import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Input } from '../design-kit.tsx'

// Groups raw food rows sharing a product name (e.g. multiple Kit Kat
// sizes) into one searchable entry with a variant picker, so callers
// don't each reimplement this. A row with no product_name groups by
// its own name and is therefore always a group of one.
function groupByProduct(rows) {
  const order = []
  const byKey = new Map()
  for (const row of rows) {
    const displayName = (row.product_name || row.name).trim()
    const key = displayName.toLowerCase()
    if (!byKey.has(key)) {
      byKey.set(key, { key, displayName, rows: [] })
      order.push(key)
    }
    byKey.get(key).rows.push(row)
  }
  return order.map((key) => byKey.get(key))
}

export default function FoodSearchInput({ name, placeholder = 'Search foods…', onSelect, onQueryChange }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    onQueryChange?.({ query, suggestions })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, suggestions])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      const q = query.trim()
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('is_permanent', true)
        .or(`name.ilike.%${q}%,product_name.ilike.%${q}%`)
        .limit(20)
      if (cancelled) return
      if (!error) setSuggestions(data)
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  function pick(food) {
    onSelect(food)
    setQuery(food.product_name || food.name)
    setSuggestions([])
  }

  function handleChange(e) {
    setQuery(e.target.value)
    onSelect(null)
  }

  const groups = groupByProduct(suggestions)

  return (
    <div>
      <Input name={name} placeholder={placeholder} value={query} onChange={handleChange} />
      {groups.length > 0 && (
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            marginTop: 'var(--space-2)',
            overflow: 'hidden',
          }}
        >
          {groups.map((group) => {
            if (group.rows.length === 1) {
              const f = group.rows[0]
              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => pick(f)}
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
                  {group.displayName} <span style={{ color: 'var(--muted)' }}>· {f.calories} cal/100g</span>
                </button>
              )
            }

            return (
              <div
                key={group.key}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}>{group.displayName}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                    {group.rows.length} variants
                  </span>
                </div>
                <select
                  className="dk-input"
                  value=""
                  onChange={(e) => {
                    const food = group.rows.find((r) => r.id === e.target.value)
                    if (food) pick(food)
                  }}
                >
                  <option value="" disabled>
                    Choose a variant…
                  </option>
                  {group.rows.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.variant_label || r.name} · {r.calories} cal/100g
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
