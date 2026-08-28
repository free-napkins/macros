import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../lib/SessionContext.jsx'
import { calculateMacroGoal } from '../lib/macroCalc.js'
import { lbToKg, feetInchesToCm } from '../lib/units.js'
import { Card, Input, Button } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

const initial = {
  unitSystem: 'metric',
  sex: 'male',
  birthDate: '',
  heightCm: '',
  heightFeet: '',
  heightInches: '',
  weightKg: '',
  weightLb: '',
  activityLevel: 'moderate',
  goalType: 'maintain',
  rateKgPerWeek: '0.5',
  rateLbPerWeek: '1',
}

export default function Onboarding({ onComplete }) {
  const session = useSession()
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const isImperial = form.unitSystem === 'imperial'

  const heightCm = isImperial
    ? feetInchesToCm(parseFloat(form.heightFeet) || 0, parseFloat(form.heightInches) || 0)
    : parseFloat(form.heightCm) || 0
  const weightKg = isImperial ? lbToKg(parseFloat(form.weightLb) || 0) : parseFloat(form.weightKg) || 0

  const isValid = form.birthDate && heightCm > 0 && weightKg > 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    setSaving(true)
    setError(null)

    const rateKgPerWeek =
      form.goalType === 'maintain'
        ? 0
        : isImperial
        ? lbToKg(parseFloat(form.rateLbPerWeek) || 0)
        : parseFloat(form.rateKgPerWeek) || 0

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
      user_id: session.user.id,
      sex: form.sex,
      birth_date: form.birthDate,
      height_cm: heightCm,
      activity_level: form.activityLevel,
      goal_type: form.goalType,
      rate_kg_per_week: rateKgPerWeek,
      unit_system: form.unitSystem,
    })
    if (profileError) {
      setSaving(false)
      setError(profileError.message)
      return
    }

    const { error: weightError } = await supabase
      .from('weight_logs')
      .upsert({ user_id: session.user.id, date: todayDate(), weight_kg: weightKg }, { onConflict: 'user_id,date' })
    if (weightError) {
      setSaving(false)
      setError(weightError.message)
      return
    }

    const { error: goalError } = await supabase.from('macro_goals').insert({
      user_id: session.user.id,
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
        <div className="dk-field">
          <label className="dk-field__label" htmlFor="unitSystem">Units</label>
          <select
            id="unitSystem"
            className="dk-input"
            value={form.unitSystem}
            onChange={(e) => update('unitSystem', e.target.value)}
          >
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lb, ft/in)</option>
          </select>
        </div>

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

          {isImperial ? (
            <>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Input
                  label="Height (ft)"
                  name="heightFeet"
                  type="number"
                  min="0"
                  value={form.heightFeet}
                  onChange={(e) => update('heightFeet', e.target.value)}
                  required
                />
                <Input
                  label="Height (in)"
                  name="heightInches"
                  type="number"
                  min="0"
                  max="11"
                  value={form.heightInches}
                  onChange={(e) => update('heightInches', e.target.value)}
                />
              </div>
              <Input
                label="Current weight (lb)"
                name="weightLb"
                type="number"
                min="0"
                step="0.1"
                value={form.weightLb}
                onChange={(e) => update('weightLb', e.target.value)}
                required
              />
            </>
          ) : (
            <>
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
            </>
          )}
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

        {form.goalType !== 'maintain' && isImperial && (
          <Input
            label={`Target rate (lb/week ${form.goalType === 'lose' ? 'loss' : 'gain'})`}
            name="rateLbPerWeek"
            type="number"
            min="0.2"
            max="2"
            step="0.1"
            value={form.rateLbPerWeek}
            onChange={(e) => update('rateLbPerWeek', e.target.value)}
          />
        )}
        {form.goalType !== 'maintain' && !isImperial && (
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
