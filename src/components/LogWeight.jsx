import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, Input, Button } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function LogWeight({ onLogged }) {
  const [weightKg, setWeightKg] = useState('')
  const [todayEntry, setTodayEntry] = useState(undefined) // undefined = loading
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('date', todayDate())
      .maybeSingle()
    if (error) {
      setError(error.message)
      return
    }
    setTodayEntry(data)
    if (data) setWeightKg(String(data.weight_kg))
  }

  useEffect(() => {
    load()
  }, [])

  async function save() {
    const w = parseFloat(weightKg)
    if (!w || w <= 0) return
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('weight_logs')
      .upsert({ date: todayDate(), weight_kg: w }, { onConflict: 'date' })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    await load()
    onLogged?.()
  }

  return (
    <Card eyebrow="Today" title="Weight">
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>
          <Input
            label="Weight (kg)"
            name="today-weight"
            type="number"
            min="0"
            step="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </div>
        <Button onClick={save} disabled={saving || !weightKg}>
          {todayEntry ? 'Update' : 'Log'}
        </Button>
      </div>
      {error && <span className="dk-field__error">{error}</span>}
    </Card>
  )
}
