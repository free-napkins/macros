import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { logContribution, sumContributions } from '../lib/macroMath'
import { Card } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function TodayTotals({ refreshKey = 0 }) {
  const [totals, setTotals] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('logs')
        .select('grams, foods(*), recipes(*, recipe_ingredients(grams, foods(*)))')
        .eq('date', todayDate())

      if (cancelled) return
      if (error) {
        setError(error.message)
        return
      }
      setTotals(sumContributions(data.map(logContribution)))
    }

    load()
    return () => { cancelled = true }
  }, [refreshKey])

  if (error) {
    return (
      <Card eyebrow="Today">
        <span className="dk-field__error">{error}</span>
      </Card>
    )
  }

  if (!totals) {
    return <Card eyebrow="Today">Loading…</Card>
  }

  return (
    <Card eyebrow="Today" title="Totals">
      <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
        <Stat label="Calories" value={Math.round(totals.calories)} big />
        <Stat label="Protein" value={Math.round(totals.protein_g)} unit="g" />
        <Stat label="Carbs" value={Math.round(totals.carbs_g)} unit="g" />
        <Stat label="Fat" value={Math.round(totals.fat_g)} unit="g" />
      </div>
    </Card>
  )
}

function Stat({ label, value, unit = '', big = false }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: big ? '3rem' : '1.75rem',
          color: big ? 'var(--accent)' : 'var(--fg)',
          lineHeight: 1,
        }}
      >
        {value}{unit}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginTop: 'var(--space-2)',
        }}
      >
        {label}
      </div>
    </div>
  )
}
