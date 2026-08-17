import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { logContribution } from '../lib/macroMath'
import { computeAdaptiveAdjustment } from '../lib/adaptiveGoals.js'
import { Card, Button, Badge } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function AdaptiveGoalBanner({ onAdjusted }) {
  const [result, setResult] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const [{ data: profile }, { data: goals }] = await Promise.all([
        supabase.from('profile').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('macro_goals').select('*').order('effective_date', { ascending: true }),
      ])
      if (cancelled || !profile || !goals || goals.length === 0) return

      const lastGoal = goals[goals.length - 1]

      const [{ data: weightRows }, { data: logRows }] = await Promise.all([
        supabase.from('weight_logs').select('date, weight_kg').gte('date', lastGoal.effective_date),
        supabase
          .from('logs')
          .select('date, grams, foods(*), recipes(*, recipe_ingredients(grams, foods(*)))')
          .gte('date', lastGoal.effective_date),
      ])
      if (cancelled || !weightRows || !logRows) return

      const caloriesByDate = {}
      logRows.forEach((log) => {
        const c = logContribution(log)
        caloriesByDate[log.date] = (caloriesByDate[log.date] || 0) + c.calories
      })

      const currentWeightKg = weightRows.length
        ? [...weightRows].sort((a, b) => (a.date < b.date ? 1 : -1))[0].weight_kg
        : null
      if (!currentWeightKg) return

      const adjustment = computeAdaptiveAdjustment({
        today: todayDate(),
        lastGoal,
        weightEntries: weightRows,
        caloriesByDate,
        goalType: profile.goal_type,
        rateKgPerWeek: profile.rate_kg_per_week,
        currentWeightKg,
      })

      if (!adjustment || cancelled) return

      const { error } = await supabase.from('macro_goals').insert({
        effective_date: todayDate(),
        calories: adjustment.calories,
        protein_g: adjustment.protein_g,
        carbs_g: adjustment.carbs_g,
        fat_g: adjustment.fat_g,
        reason: adjustment.reason,
      })
      if (error || cancelled) return

      setResult(adjustment)
      onAdjusted?.()
    }

    run()
    return () => { cancelled = true }
    // Runs once per page load — not tied to refreshKey, to avoid
    // re-checking (and potentially re-inserting) on every quick-add.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!result || dismissed) return null

  const up = result.calories > result.previousCalories

  return (
    <Card elevated>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Badge tone={up ? 'accent' : 'amber'}>Goal adjusted</Badge>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-lg)' }}>
            {result.previousCalories} &rarr; {result.calories} cal
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-strong)', maxWidth: '48ch' }}>
            {result.reason}
          </div>
        </div>
        <Button variant="ghost" onClick={() => setDismissed(true)}>Dismiss</Button>
      </div>
    </Card>
  )
}
