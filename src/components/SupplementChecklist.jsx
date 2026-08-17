import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { scanLabel } from '../lib/scanLabel.js'
import { Card, Input, Button, Badge } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function SupplementChecklist() {
  const [supplements, setSupplements] = useState(null)
  const [logsBySupplement, setLogsBySupplement] = useState({})
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDose, setNewDose] = useState('')
  const [newNutrients, setNewNutrients] = useState({})
  const [saving, setSaving] = useState(false)
  const [parsing, setParsing] = useState(false)

  async function load() {
    const [{ data: supps, error: suppsError }, { data: logs, error: logsError }] = await Promise.all([
      supabase.from('supplements').select('*').order('name'),
      supabase.from('supplement_logs').select('*').eq('date', todayDate()),
    ])
    if (suppsError) {
      setError(suppsError.message)
      return
    }
    if (logsError) {
      setError(logsError.message)
      return
    }
    setSupplements(supps)
    setLogsBySupplement(Object.fromEntries(logs.map((l) => [l.supplement_id, l])))
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleTaken(supplement) {
    const currentlyTaken = logsBySupplement[supplement.id]?.taken ?? false
    const nextTaken = !currentlyTaken
    const { data, error } = await supabase
      .from('supplement_logs')
      .upsert(
        {
          supplement_id: supplement.id,
          date: todayDate(),
          taken: nextTaken,
          taken_at: nextTaken ? new Date().toISOString() : null,
        },
        { onConflict: 'supplement_id,date' }
      )
      .select()
    if (error) {
      setError(error.message)
      return
    }
    setLogsBySupplement((m) => ({ ...m, [supplement.id]: data[0] }))
  }

  async function addSupplement() {
    if (!newName.trim()) return
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('supplements')
      .insert({ name: newName.trim(), dose_label: newDose.trim() || null, nutrients: newNutrients })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setNewName('')
    setNewDose('')
    setNewNutrients({})
    setShowAddForm(false)
    load()
  }

  async function handleScan(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setParsing(true)
    setError(null)
    try {
      const result = await scanLabel(file, 'supplement')
      setNewName(result.name || '')
      setNewDose(result.dose_label || '')
      setNewNutrients(result.nutrients || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setParsing(false)
    }
  }

  if (error) {
    return (
      <Card eyebrow="Account" title="Supplements">
        <span className="dk-field__error">{error}</span>
      </Card>
    )
  }

  if (!supplements) {
    return (
      <Card eyebrow="Account" title="Supplements">
        Loading…
      </Card>
    )
  }

  return (
    <Card eyebrow="Account" title="Supplements">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {supplements.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>No supplements yet.</div>
        )}

        {supplements.map((s) => {
          const taken = logsBySupplement[s.id]?.taken ?? false
          return (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-3)',
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{s.name}</div>
                {s.dose_label && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{s.dose_label}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => toggleTaken(s)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <Badge tone={taken ? 'accent' : 'neutral'} dot>
                  {taken ? 'Taken' : 'Not yet'}
                </Badge>
              </button>
            </div>
          )
        })}

        {!showAddForm && (
          <Button variant="ghost" onClick={() => setShowAddForm(true)}>
            + Add supplement
          </Button>
        )}

        {showAddForm && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label
              className="dk-btn dk-btn--ghost"
              style={{ display: 'inline-flex', cursor: 'pointer', width: 'fit-content' }}
            >
              {parsing ? 'Reading label…' : 'Scan label instead'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleScan}
                disabled={parsing}
                style={{ display: 'none' }}
              />
            </label>
            <Input label="Name" name="supplement-name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input
              label="Dose (optional)"
              name="supplement-dose"
              placeholder="e.g. 2 capsules"
              value={newDose}
              onChange={(e) => setNewDose(e.target.value)}
            />
            {Object.keys(newNutrients).length > 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                + {Object.keys(newNutrients).length} nutrient{Object.keys(newNutrients).length === 1 ? '' : 's'} detected
              </div>
            )}
            <Button onClick={addSupplement} disabled={saving || !newName.trim()}>
              Save
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
