import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { logContribution, sumContributions } from '../lib/macroMath'
import { statusForPercent, STATUS_COLORS } from '../lib/macroCalc.js'
import { orderedMicronutrients } from '../lib/nutrients.js'
import { Card, Button } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

const ROWS = [
  { key: 'calories', label: 'Calories', unit: '' },
  { key: 'protein_g', label: 'Protein', unit: 'g' },
  { key: 'carbs_g', label: 'Carbs', unit: 'g' },
  { key: 'fat_g', label: 'Fat', unit: 'g' },
]

export default function TodayTotals({ refreshKey = 0 }) {
  const [totals, setTotals] = useState(null)
  const [goal, setGoal] = useState(undefined) // undefined = loading, null = none yet
  const [error, setError] = useState(null)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [logsRes, goalRes] = await Promise.all([
        supabase
          .from('logs')
          .select('grams, foods(*), recipes(*, recipe_ingredients(grams, foods(*)))')
          .eq('date', todayDate()),
        supabase
          .from('macro_goals')
          .select('*')
          .order('effective_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      if (cancelled) return
      if (logsRes.error) {
        setError(logsRes.error.message)
        return
      }
      if (goalRes.error) {
        setError(goalRes.error.message)
        return
      }
      setTotals(sumContributions(logsRes.data.map(logContribution)))
      setGoal(goalRes.data)
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

  if (!totals || goal === undefined) {
    return <Card eyebrow="Today">Loading…</Card>
  }

  if (!goal) {
    return (
      <Card eyebrow="Today" title="Totals">
        <span style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>No goal set yet.</span>
      </Card>
    )
  }

  return (
    <Card eyebrow="Today" title="Totals">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {ROWS.map((row) => {
          const value = totals[row.key]
          const target = goal[row.key]
          const pct = target > 0 ? (value / target) * 100 : 0
          const status = statusForPercent(pct)
          const widthPct = Math.min(100, pct)

          return (
            <div key={row.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--muted-strong)',
                }}
              >
                <span>{row.label}</span>
                <span>
                  {Math.round(value)}
                  {row.unit} / {Math.round(target)}
                  {row.unit}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '14px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,.06)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: widthPct + '%',
                    borderRadius: '999px',
                    background: STATUS_COLORS[status],
                    transition: 'width 2000ms cubic-bezier(.16,1,.3,1), background 2000ms cubic-bezier(.16,1,.3,1)',
                  }}
                />
              </div>
            </div>
          )
        })}

        <Button variant="ghost" onClick={() => setShowMore((v) => !v)}>
          {showMore ? 'Hide' : 'View more'} nutrients
        </Button>

        {showMore && <MoreNutrients totals={totals} />}
      </div>
    </Card>
  )
}

const EXTRA_ROWS = [
  { key: 'fiber_g', label: 'Fiber', unit: 'g' },
  { key: 'sugar_g', label: 'Sugar', unit: 'g' },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg' },
]

function MoreNutrients({ totals }) {
  const micros = orderedMicronutrients(totals.micronutrients || {})

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        paddingTop: 'var(--space-2)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {EXTRA_ROWS.map((row) => (
        <NutrientRow key={row.key} label={row.label} value={totals[row.key]} unit={row.unit} />
      ))}
      {micros.map((m) => (
        <NutrientRow key={m.key} label={m.label} value={totals.micronutrients[m.key]} unit={m.unit} />
      ))}
      {micros.length === 0 && (
        <span style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>
          No micronutrient data yet — logged foods from the whole-foods database will show up here.
        </span>
      )}
    </div>
  )
}

function NutrientRow({ label, value, unit }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--muted-strong)',
      }}
    >
      <span>{label}</span>
      <span>
        {Math.round(value * 10) / 10}
        {unit}
      </span>
    </div>
  )
}
