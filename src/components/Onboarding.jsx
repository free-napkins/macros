import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { calculateMacroGoal } from '../lib/macroCalc.js'
import { Card, Input, Button } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

const initial = {
  sex: 'male',
  birthDate: '',
  heightCm: '',
  weightKg: '',
  activityLevel: 'moderate',
  goalType: 'maintain',
  rateKgPerWeek: '0.5',
}

export default function Onboarding({ onComplete }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const isValid = form.birthDate && parseFloat(form.heightCm) > 0 && parseFloat(form.weightKg) > 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    setSaving(true)
    setError(null)

    const heightCm = parseFloat(form.heightCm)
    const weightKg = parseFloat(form.weightKg)
    const rateKgPerWeek = form.goalType === 'maintain' ? 0 : parseFloat(form.rateKgPerWeek) || 0

    const goal = calculateMacroGoal({
      sex: form.sex,
      birthDate: form.birthDate,
      heightCm,
      weightKg,
      activityLevel: form.activityLevel,
      goalType: form.goalType,
      rateKgPerWeek,
    })

    const { error: profileError } = await supabase.from('profile').insert({
      sex: form.sex,
      birth_date: form.birthDate,
      height_cm: heightCm,
      activity_level: form.activityLevel,
      goal_type: form.goalType,
      rate_kg_per_week: rateKgPerWeek,
    })
    if (profileError) {
      setSaving(false)
      setError(profileError.message)
      return
    }

    const { error: weightError } = await supabase
      .from('weight_logs')
      .upsert({ date: todayDate(), weight_kg: weightKg }, { onConflict: 'date' })
    if (weightError) {
      setSaving(false)
      setError(weightError.message)
      return
    }

    const { error: goalError } = await supabase.from('macro_goals').insert({
      effective_date: todayDate(),
      calories: goal.calories,
      protein_g: goal.protein_g,
      carbs_g: goal.carbs_g,
      fat_g: goal.fat_g,
      reason: 'onboarding',
    })
    setSaving(false)
    if (goalError) {
      setError(goalError.message)
      return
    }

    onComplete?.()
  }

  return (
    <Card eyebrow="Setup" title="Let's set your goals">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="dk-field">
            <label className="dk-field__label" htmlFor="sex">Sex</label>
            <select id="sex" className="dk-input" value={form.sex} onChange={(e) => update('sex', e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <Input
            label="Birth date"
            name="birthDate"
            type="date"
            value={form.birthDate}
            onChange={(e) => update('birthDate', e.target.value)}
            required
          />
          <Input
            label="Height (cm)"
            name="heightCm"
            type="number"
            min="0"
            value={form.heightCm}
            onChange={(e) => update('heightCm', e.target.value)}
            required
          />
          <Input
            label="Current weight (kg)"
            name="weightKg"
            type="number"
            min="0"
            step="0.1"
            value={form.weightKg}
            onChange={(e) => update('weightKg', e.target.value)}
            required
          />
        </div>

        <div className="dk-field">
          <label className="dk-field__label" htmlFor="activityLevel">Activity level</label>
          <select
            id="activityLevel"
            className="dk-input"
            value={form.activityLevel}
            onChange={(e) => update('activityLevel', e.target.value)}
          >
            <option value="sedentary">Sedentary — little to no exercise</option>
            <option value="light">Light — exercise 1-3 days/week</option>
            <option value="moderate">Moderate — exercise 3-5 days/week</option>
            <option value="active">Active — exercise 6-7 days/week</option>
            <option value="very_active">Very active — hard daily exercise or physical job</option>
          </select>
        </div>

        <div className="dk-field">
          <label className="dk-field__label" htmlFor="goalType">Goal</label>
          <select id="goalType" className="dk-input" value={form.goalType} onChange={(e) => update('goalType', e.target.value)}>
            <option value="lose">Lose weight</option>
            <option value="maintain">Maintain weight</option>
            <option value="gain">Gain weight</option>
          </select>
        </div>

        {form.goalType !== 'maintain' && (
          <Input
            label={`Target rate (kg/week ${form.goalType === 'lose' ? 'loss' : 'gain'})`}
            name="rateKgPerWeek"
            type="number"
            min="0.1"
            max="1"
            step="0.1"
            value={form.rateKgPerWeek}
            onChange={(e) => update('rateKgPerWeek', e.target.value)}
          />
        )}

        <Button type="submit" disabled={!isValid || saving}>
          {saving ? 'Calculating…' : 'Calculate my goals'}
        </Button>

        {error && <span className="dk-field__error">{error}</span>}
      </form>
    </Card>
  )
}
