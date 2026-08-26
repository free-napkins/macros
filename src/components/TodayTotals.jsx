import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { logContribution, sumContributions } from '../lib/macroMath'
import { statusForPercent, STATUS_COLORS } from '../lib/macroCalc.js'
import NutrientSections from './NutrientSections.jsx'
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
  const [sexWeight, setSexWeight] = useState(null)
  const [error, setError] = useState(null)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [logsRes, goalRes, profileRes, weightRes] = await Promise.all([
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
        supabase.from('profile').select('sex').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('weight_logs').select('weight_kg').order('date', { ascending: false }).limit(1).maybeSingle(),
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
      setSexWeight({
        sex: profileRes.data?.sex || 'male',
        weightKg: weightRes.data?.weight_kg || null,
      })
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

        {showMore && <NutrientSections totals={totals} mode="targets" sexWeight={sexWeight} />}
      </div>
    </Card>
  )
}
