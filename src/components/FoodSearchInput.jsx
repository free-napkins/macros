import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Input } from '../design-kit.tsx'

export default function FoodSearchInput({ name, placeholder = 'Search foods…', onSelect }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
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

  function pick(food) {
    onSelect(food)
    setQuery(food.name)
    setSuggestions([])
  }

  function handleChange(e) {
    setQuery(e.target.value)
    onSelect(null)
  }

  return (
    <div>
      <Input name={name} placeholder={placeholder} value={query} onChange={handleChange} />
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
              {f.name} <span style={{ color: 'var(--muted)' }}>· {f.calories} cal/100g</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
