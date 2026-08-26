import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { logContribution } from '../lib/macroMath'
import { statusForPercent, STATUS_COLORS } from '../lib/macroCalc.js'
import { useUnitSystem } from '../lib/UnitContext.jsx'
import { kgToLb, WEIGHT_UNIT_LABEL } from '../lib/units.js'
import { Card, Button } from '../design-kit.tsx'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toDateStr(d) {
  return d.toISOString().slice(0, 10)
}

// Goal in effect on a given date: the most recent goal row whose
// effective_date is on or before it. Assumes goals is sorted ascending.
function goalForDate(goals, dateStr) {
  let active = null
  for (const g of goals) {
    if (g.effective_date <= dateStr) active = g
    else break
  }
  return active
}

export default function HistoryCalendar() {
  const { unitSystem } = useUnitSystem()
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [weightByDate, setWeightByDate] = useState({})
  const [caloriesByDate, setCaloriesByDate] = useState({})
  const [goals, setGoals] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  const monthStartStr = toDateStr(monthStart)
  const monthEndStr = toDateStr(monthEnd)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function load() {
      const [weightRes, logsRes, goalsRes] = await Promise.all([
        supabase.from('weight_logs').select('date, weight_kg').gte('date', monthStartStr).lte('date', monthEndStr),
        supabase
          .from('logs')
          .select('date, grams, foods(*), recipes(*, recipe_ingredients(grams, foods(*)))')
          .gte('date', monthStartStr)
          .lte('date', monthEndStr),
        supabase.from('macro_goals').select('*').order('effective_date', { ascending: true }),
      ])

      if (cancelled) return
      const err = weightRes.error || logsRes.error || goalsRes.error
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const wByDate = {}
      weightRes.data.forEach((w) => { wByDate[w.date] = w.weight_kg })

      const calByDate = {}
      logsRes.data.forEach((log) => {
        const c = logContribution(log)
        calByDate[log.date] = (calByDate[log.date] || 0) + c.calories
      })

      setWeightByDate(wByDate)
      setCaloriesByDate(calByDate)
      setGoals(goalsRes.data)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [monthStartStr, monthEndStr])

  const cells = useMemo(() => {
    const daysInMonth = monthEnd.getDate()
    const leadingBlanks = monthStart.getDay()
    const result = []
    for (let i = 0; i < leadingBlanks; i++) result.push(null)
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day)
      result.push({ day, dateStr: toDateStr(d) })
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month])

  function changeMonth(delta) {
    setViewDate(new Date(year, month + delta, 1))
  }

  if (error) {
    return (
      <Card eyebrow="History" title="Calendar">
        <span className="dk-field__error">{error}</span>
      </Card>
    )
  }

  return (
    <Card eyebrow="History" title="Calendar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <Button variant="ghost" onClick={() => changeMonth(-1)}>&larr;</Button>
        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-lg)' }}>
          {MONTH_NAMES[month]} {year}
        </div>
        <Button variant="ghost" onClick={() => changeMonth(1)}>&rarr;</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: 'var(--space-2)' }}>
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
              padding: '4px 0',
            }}
          >
            {w}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', opacity: loading ? 0.5 : 1 }}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={'blank-' + i} />

          const weight = weightByDate[cell.dateStr]
          const calories = caloriesByDate[cell.dateStr]
          const activeGoal = goalForDate(goals, cell.dateStr)
          const hasData = calories !== undefined && activeGoal
          const status = hasData ? statusForPercent((calories / activeGoal.calories) * 100) : null
          const isToday = cell.dateStr === toDateStr(new Date())

          return (
            <div
              key={cell.dateStr}
              style={{
                aspectRatio: '1',
                border: isToday ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', color: 'var(--muted)' }}>
                  {cell.day}
                </span>
                {status && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: STATUS_COLORS[status],
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
              {weight !== undefined && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--muted-strong)' }}>
                  {unitSystem === 'imperial' ? Math.round(kgToLb(weight) * 10) / 10 : weight}
                  {WEIGHT_UNIT_LABEL[unitSystem]}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: '.68rem', color: 'var(--muted)' }}>
        <Legend color={STATUS_COLORS.blue} label="Under" />
        <Legend color={STATUS_COLORS.green} label="On target" />
        <Legend color={STATUS_COLORS.orange} label="Over" />
      </div>
    </Card>
  )
}

function Legend({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
      {label}
    </span>
  )
}
