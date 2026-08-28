import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../lib/SessionContext.jsx'
import { useUnitSystem } from '../lib/UnitContext.jsx'
import { kgToLb, lbToKg, WEIGHT_UNIT_LABEL } from '../lib/units.js'
import { Card, Input, Button } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function LogWeight({ onLogged }) {
  const session = useSession()
  const { unitSystem } = useUnitSystem()
  const [weightDisplay, setWeightDisplay] = useState('')
  const [todayEntry, setTodayEntry] = useState(undefined) // undefined = loading
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    if (!session) return
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', todayDate())
      .maybeSingle()
    if (error) {
      setError(error.message)
      return
    }
    setTodayEntry(data)
    if (data) {
      const val = unitSystem === 'imperial' ? kgToLb(data.weight_kg) : data.weight_kg
      setWeightDisplay(String(Math.round(val * 10) / 10))
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, unitSystem])

  async function save() {
    if (!session) return
    const displayVal = parseFloat(weightDisplay)
    if (!displayVal || displayVal <= 0) return
    const weightKg = unitSystem === 'imperial' ? lbToKg(displayVal) : displayVal
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('weight_logs')
      .upsert({ user_id: session.user.id, date: todayDate(), weight_kg: weightKg }, { onConflict: 'user_id,date' })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    await load()
    onLogged?.()
  }

  const unitLabel = WEIGHT_UNIT_LABEL[unitSystem]

  return (
    <Card eyebrow="Today" title="Weight">
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>
          <Input
            label={`Weight (${unitLabel})`}
            name="today-weight"
            type="number"
            min="0"
            step="0.1"
            value={weightDisplay}
            onChange={(e) => setWeightDisplay(e.target.value)}
          />
        </div>
        <Button onClick={save} disabled={saving || !weightDisplay}>
          {todayEntry ? 'Update' : 'Log'}
        </Button>
      </div>
      {error && <span className="dk-field__error">{error}</span>}
    </Card>
  )
}
