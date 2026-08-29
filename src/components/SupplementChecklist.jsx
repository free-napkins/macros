import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSession } from '../lib/SessionContext.jsx'
import { scanLabel } from '../lib/scanLabel.js'
import NutrientSections from './NutrientSections.jsx'
import { Card, Input, Button, Badge } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function lerpColor(hexA, hexB, t) {
  t = Math.max(0, Math.min(1, t))
  const a = parseInt(hexA.slice(1), 16)
  const b = parseInt(hexB.slice(1), 16)
  const r = Math.round(((a >> 16) & 255) + ((((b >> 16) & 255) - ((a >> 16) & 255)) * t))
  const g = Math.round(((a >> 8) & 255) + ((((b >> 8) & 255) - ((a >> 8) & 255)) * t))
  const bl = Math.round((a & 255) + (((b & 255) - (a & 255)) * t))
  return `rgb(${r}, ${g}, ${bl})`
}

// null when there isn't enough data (no remaining count set, or no
// dosing frequency) to project anything.
function computeRunOut(s) {
  if (s.remaining_servings == null || !s.doses_per_day || s.doses_per_day <= 0) return null
  const daysLeft = s.remaining_servings / s.doses_per_day
  const runOutDate = new Date()
  runOutDate.setDate(runOutDate.getDate() + Math.floor(daysLeft))
  const color = lerpColor('#EF4444', '#3CFF9E', daysLeft / 30) // red at 0 days, green at 30+
  return { daysLeft, runOutDate: runOutDate.toISOString().slice(0, 10), color }
}

const emptyNew = { name: '', dose: '', servingsPerContainer: '', dosesPerDay: '1' }

export default function SupplementChecklist() {
  const session = useSession()
  const [supplements, setSupplements] = useState(null)
  const [logsBySupplement, setLogsBySupplement] = useState({})
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newForm, setNewForm] = useState(emptyNew)
  const [newNutrients, setNewNutrients] = useState({})
  const [saving, setSaving] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(null)

  async function load() {
    if (!session) return
    const userId = session.user.id
    const [{ data: supps, error: suppsError }, { data: logs, error: logsError }] = await Promise.all([
      supabase.from('supplements').select('*').eq('user_id', userId).order('name'),
      supabase.from('supplement_logs').select('*').eq('user_id', userId).eq('date', todayDate()),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  async function toggleTaken(supplement) {
    const currentlyTaken = logsBySupplement[supplement.id]?.taken ?? false
    const nextTaken = !currentlyTaken
    const { data, error } = await supabase
      .from('supplement_logs')
      .upsert(
        {
          user_id: session.user.id,
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

    // Inventory bookkeeping happens after the taken-state is confirmed
    // saved, so a failure here only leaves the count stale (fixable via
    // Edit) rather than risking the reverse: the count silently
    // drifting while the checklist shows nothing happened.
    if (supplement.remaining_servings != null) {
      const delta = nextTaken ? -supplement.doses_per_day : supplement.doses_per_day
      const { data: updated, error: updateError } = await supabase
        .from('supplements')
        .update({ remaining_servings: supplement.remaining_servings + delta })
        .eq('id', supplement.id)
        .select()
      if (!updateError && updated) {
        setSupplements((list) => list.map((x) => (x.id === supplement.id ? updated[0] : x)))
      }
    }
  }

  async function addSupplement() {
    if (!newForm.name.trim()) return
    setSaving(true)
    setError(null)
    const servingsPerContainer = newForm.servingsPerContainer ? parseFloat(newForm.servingsPerContainer) : null
    const { error } = await supabase.from('supplements').insert({
      user_id: session.user.id,
      name: newForm.name.trim(),
      dose_label: newForm.dose.trim() || null,
      nutrients: newNutrients,
      servings_per_container: servingsPerContainer,
      remaining_servings: servingsPerContainer,
      doses_per_day: parseFloat(newForm.dosesPerDay) || 1,
    })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setNewForm(emptyNew)
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
      setNewForm((f) => ({
        ...f,
        name: result.name || '',
        dose: result.dose_label || '',
        servingsPerContainer: result.servings_per_container ? String(result.servings_per_container) : '',
      }))
      setNewNutrients(result.nutrients || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setParsing(false)
    }
  }

  function startEdit(s) {
    setExpandedId(null)
    setEditingId(s.id)
    setEditForm({
      name: s.name,
      dose: s.dose_label || '',
      servingsPerContainer: s.servings_per_container ?? '',
      remainingServings: s.remaining_servings ?? '',
      dosesPerDay: String(s.doses_per_day ?? 1),
    })
  }

  async function saveEdit(id) {
    setSaving(true)
    setError(null)
    const { data, error } = await supabase
      .from('supplements')
      .update({
        name: editForm.name.trim(),
        dose_label: editForm.dose.trim() || null,
        servings_per_container: editForm.servingsPerContainer !== '' ? parseFloat(editForm.servingsPerContainer) : null,
        remaining_servings: editForm.remainingServings !== '' ? parseFloat(editForm.remainingServings) : null,
        doses_per_day: parseFloat(editForm.dosesPerDay) || 1,
      })
      .eq('id', id)
      .select()
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setSupplements((list) => list.map((x) => (x.id === id ? data[0] : x)))
    setEditingId(null)
    setEditForm(null)
  }

  async function deleteSupplement(s) {
    if (!window.confirm(`Delete "${s.name}"? This also removes its taken-history.`)) return
    setError(null)
    const { error } = await supabase.from('supplements').delete().eq('id', s.id)
    if (error) {
      setError(error.message)
      return
    }
    setSupplements((list) => list.filter((x) => x.id !== s.id))
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
          const expanded = expandedId === s.id
          const editing = editingId === s.id
          const nutrientCount = Object.keys(s.nutrients || {}).length
          const runOut = computeRunOut(s)

          if (editing) {
            return (
              <div key={s.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Input label="Name" name={`edit-name-${s.id}`} value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                <Input label="Dose" name={`edit-dose-${s.id}`} value={editForm.dose} onChange={(e) => setEditForm((f) => ({ ...f, dose: e.target.value }))} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
                  <Input
                    label="Servings per container"
                    name={`edit-spc-${s.id}`}
                    type="number"
                    min="0"
                    value={editForm.servingsPerContainer}
                    onChange={(e) => setEditForm((f) => ({ ...f, servingsPerContainer: e.target.value }))}
                  />
                  <Input
                    label="Remaining servings"
                    name={`edit-remaining-${s.id}`}
                    type="number"
                    min="0"
                    value={editForm.remainingServings}
                    onChange={(e) => setEditForm((f) => ({ ...f, remainingServings: e.target.value }))}
                  />
                  <Input
                    label="Doses per day"
                    name={`edit-frequency-${s.id}`}
                    type="number"
                    min="0"
                    step="0.5"
                    value={editForm.dosesPerDay}
                    onChange={(e) => setEditForm((f) => ({ ...f, dosesPerDay: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <Button onClick={() => saveEdit(s.id)} disabled={saving || !editForm.name.trim()}>
                    Save
                  </Button>
                  <Button variant="ghost" onClick={() => { setEditingId(null); setEditForm(null) }} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </div>
            )
          }

          return (
            <div key={s.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : s.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                    {s.dose_label}
                    {s.dose_label && nutrientCount > 0 ? ' · ' : ''}
                    {nutrientCount > 0 && `${expanded ? 'Hide' : 'View'} nutrition facts`}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => toggleTaken(s)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
                >
                  <Badge tone={taken ? 'accent' : 'neutral'} dot>
                    {taken ? 'Taken' : 'Not yet'}
                  </Badge>
                </button>
              </div>

              {(s.remaining_servings != null || runOut) && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', marginTop: '4px', color: runOut ? runOut.color : 'var(--muted)' }}>
                  {s.remaining_servings != null && `${s.remaining_servings}${s.servings_per_container ? `/${s.servings_per_container}` : ''} left`}
                  {runOut && ` · runs out ~${runOut.runOutDate}`}
                </div>
              )}

              {expanded && nutrientCount > 0 && (
                <div
                  style={{
                    marginTop: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <NutrientSections
                    totals={{ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0, micronutrients: s.nutrients }}
                    mode="values"
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: '4px' }}>
                <Button variant="link" onClick={() => startEdit(s)}>
                  Edit
                </Button>
                <Button variant="link" onClick={() => deleteSupplement(s)}>
                  Delete
                </Button>
              </div>
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
            <Input label="Name" name="supplement-name" value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} />
            <Input
              label="Dose (optional)"
              name="supplement-dose"
              placeholder="e.g. 2 capsules"
              value={newForm.dose}
              onChange={(e) => setNewForm((f) => ({ ...f, dose: e.target.value }))}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
              <Input
                label="Servings per container"
                name="supplement-servings-per-container"
                type="number"
                min="0"
                placeholder="e.g. 60"
                value={newForm.servingsPerContainer}
                onChange={(e) => setNewForm((f) => ({ ...f, servingsPerContainer: e.target.value }))}
              />
              <Input
                label="Doses per day"
                name="supplement-doses-per-day"
                type="number"
                min="0"
                step="0.5"
                value={newForm.dosesPerDay}
                onChange={(e) => setNewForm((f) => ({ ...f, dosesPerDay: e.target.value }))}
              />
            </div>
            {Object.keys(newNutrients).length > 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                + {Object.keys(newNutrients).length} nutrient{Object.keys(newNutrients).length === 1 ? '' : 's'} detected
              </div>
            )}
            <Button onClick={addSupplement} disabled={saving || !newForm.name.trim()}>
              Save
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
