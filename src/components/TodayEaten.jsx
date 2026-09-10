import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../lib/SessionContext.jsx'
import { logContribution } from '../lib/macroMath.js'
import { Card } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function TodayEaten({ refreshKey = 0 }) {
  const session = useSession()
  const [logs, setLogs] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    supabase
      .from('logs')
      .select('id, grams, foods(name, calories, protein_g, carbs_g, fat_g), recipes(name, total_grams, recipe_ingredients(grams, foods(*)))')
      .eq('user_id', session.user.id)
      .eq('date', todayDate())
      .order('logged_at', { ascending: false })
      .then(({ data, error: loadError }) => {
        if (cancelled) return
        if (loadError) setError(loadError.message)
        else setLogs(data || [])
      })
    return () => { cancelled = true }
  }, [session, refreshKey])

  return (
    <Card eyebrow="Today" title="Eaten">
      {error && <span className="dk-field__error">{error}</span>}
      {logs && logs.length === 0 && <span style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>Nothing logged yet.</span>}
      {logs && logs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {logs.map((log) => {
            const item = log.foods || log.recipes
            const contribution = logContribution(log)
            return (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', alignItems: 'baseline' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item?.name || 'Logged food'}</div>
                  <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{Math.round(log.grams)}g</div>
                </div>
                <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>{Math.round(contribution.calories)} cal</span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}