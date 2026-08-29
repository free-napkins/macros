import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { analyzeFood } from '../lib/analyzeFood.js'
import NutrientFieldsGrid from './NutrientFieldsGrid.jsx'
import { Input, Button } from '../design-kit.tsx'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

const OPENING_GREETING = "Tell me what you made or ate, and I'll help you log it or add it to your food database."

function buildEditFields(p) {
  return {
    name: p.name || '',
    product_name: '',
    variant_label: '',
    calories: p.calories ?? 0,
    protein_g: p.protein_g ?? 0,
    carbs_g: p.carbs_g ?? 0,
    fat_g: p.fat_g ?? 0,
    fiber_g: p.fiber_g ?? 0,
    sugar_g: p.sugar_g ?? 0,
    sodium_mg: p.sodium_mg ?? 0,
    serving_size_g: p.serving_size_g || null,
    serving_label: p.serving_label || '',
    micronutrients: p.micronutrients || {},
    intent: p.intent,
    entry_mode: p.entry_mode || null,
  }
}

function summarizeProposal(p) {
  if (p.intent === 'log_once') {
    return `Proposed to log "${p.name}" (${Math.round(p.calories)} cal/100g${p.grams_eaten ? `, ${Math.round(p.grams_eaten)}g eaten` : ''}).`
  }
  return `Proposed to add "${p.name}" to the food database (${Math.round(p.calories)} cal/100g, ${
    p.entry_mode === 'serving' ? `by serving${p.serving_label ? ` — ${p.serving_label}` : ''}` : 'by weight'
  }).`
}

export default function AskMode({ session, onLogged }) {
  const [messages, setMessages] = useState([{ role: 'assistant', text: OPENING_GREETING }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [editFields, setEditFields] = useState(null)
  const [gramsEaten, setGramsEaten] = useState('')
  const [saving, setSaving] = useState(false)
  const [justAdded, setJustAdded] = useState(null) // { id, name } after "add to database"
  const [logAfterAddGrams, setLogAfterAddGrams] = useState('')

  function resetChat(openingText) {
    setMessages([{ role: 'assistant', text: openingText || OPENING_GREETING }])
    setEditFields(null)
    setGramsEaten('')
    setJustAdded(null)
    setLogAfterAddGrams('')
    setError(null)
  }

  async function send(rawText) {
    const text = (rawText ?? input).trim()
    if (!text || sending) return

    let history = messages
    const last = history[history.length - 1]
    if (last?.proposal) {
      history = [...history.slice(0, -1), { role: 'assistant', text: summarizeProposal(last.proposal) }]
    }
    // If the previous send() errored out, its user turn is still sitting
    // there unanswered — the API rejects two consecutive user turns, so
    // merge into it instead of appending a separate one.
    const withUser =
      history.length && history[history.length - 1].role === 'user'
        ? [...history.slice(0, -1), { role: 'user', text: `${history[history.length - 1].text}\n${text}` }]
        : [...history, { role: 'user', text }]
    setMessages(withUser)
    setInput('')
    setEditFields(null)
    setJustAdded(null)
    setError(null)
    setSending(true)

    try {
      // The API requires the conversation to start with a user turn —
      // drop the canned opening greeting (and any synthesized proposal
      // summaries that might precede the first real user message).
      const firstUserIdx = withUser.findIndex((m) => m.role === 'user')
      const apiMessages = withUser.slice(firstUserIdx)
      const result = await analyzeFood(apiMessages)

      if (result.type === 'proposal') {
        setMessages([...withUser, { role: 'assistant', proposal: result.proposal }])
        setEditFields(buildEditFields(result.proposal))
        setGramsEaten(result.proposal.grams_eaten != null ? String(Math.round(result.proposal.grams_eaten)) : '')
      } else {
        setMessages([...withUser, { role: 'assistant', text: result.text }])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  function updateEditField(key, value) {
    setEditFields((f) => ({ ...f, [key]: value }))
  }

  async function logOnce() {
    const g = parseFloat(gramsEaten)
    if (!editFields?.name?.trim() || !g || g <= 0) return
    setSaving(true)
    setError(null)
    const { data: foodRows, error: foodError } = await supabase
      .from('foods')
      .insert({
        name: editFields.name.trim(),
        source: 'ask',
        is_permanent: false,
        product_name: editFields.product_name.trim() || null,
        variant_label: editFields.variant_label.trim() || null,
        calories: parseFloat(editFields.calories) || 0,
        protein_g: parseFloat(editFields.protein_g) || 0,
        carbs_g: parseFloat(editFields.carbs_g) || 0,
        fat_g: parseFloat(editFields.fat_g) || 0,
        fiber_g: parseFloat(editFields.fiber_g) || 0,
        sugar_g: parseFloat(editFields.sugar_g) || 0,
        sodium_mg: parseFloat(editFields.sodium_mg) || 0,
        micronutrients: editFields.micronutrients || {},
      })
      .select()
    if (foodError) {
      setSaving(false)
      setError(foodError.message)
      return
    }
    const { error: logError } = await supabase
      .from('logs')
      .insert({ user_id: session.user.id, food_id: foodRows[0].id, grams: g, date: todayDate() })
    setSaving(false)
    if (logError) {
      setError(logError.message)
      return
    }
    onLogged?.()
    resetChat(`Logged "${editFields.name.trim()}". What's next?`)
  }

  async function addPermanent() {
    if (!editFields?.name?.trim()) return
    setSaving(true)
    setError(null)
    const isServing = editFields.entry_mode === 'serving'
    const { data: foodRows, error: foodError } = await supabase
      .from('foods')
      .insert({
        name: editFields.name.trim(),
        source: 'ask',
        is_permanent: true,
        product_name: editFields.product_name.trim() || null,
        variant_label: editFields.variant_label.trim() || null,
        calories: parseFloat(editFields.calories) || 0,
        protein_g: parseFloat(editFields.protein_g) || 0,
        carbs_g: parseFloat(editFields.carbs_g) || 0,
        fat_g: parseFloat(editFields.fat_g) || 0,
        fiber_g: parseFloat(editFields.fiber_g) || 0,
        sugar_g: parseFloat(editFields.sugar_g) || 0,
        sodium_mg: parseFloat(editFields.sodium_mg) || 0,
        serving_size_g: isServing && editFields.serving_size_g ? parseFloat(editFields.serving_size_g) : null,
        serving_label: isServing ? editFields.serving_label || null : null,
        micronutrients: editFields.micronutrients || {},
      })
      .select()
    setSaving(false)
    if (foodError) {
      setError(foodError.message)
      return
    }
    setJustAdded({ id: foodRows[0].id, name: editFields.name.trim() })
  }

  async function logAfterAdd() {
    const g = parseFloat(logAfterAddGrams)
    if (!justAdded || !g || g <= 0) return
    setSaving(true)
    setError(null)
    const { error: logError } = await supabase
      .from('logs')
      .insert({ user_id: session.user.id, food_id: justAdded.id, grams: g, date: todayDate() })
    setSaving(false)
    if (logError) {
      setError(logError.message)
      return
    }
    onLogged?.()
    resetChat(`Added and logged "${justAdded.name}". What's next?`)
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {messages.map((m, i) => {
          const isLast = i === messages.length - 1
          if (m.proposal && !isLast) {
            return (
              <div key={i} style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontStyle: 'italic' }}>
                {summarizeProposal(m.proposal)}
              </div>
            )
          }
          if (m.proposal) {
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--card)', borderRadius: 'var(--radius-sm)' }}>
                {justAdded ? (
                  <>
                    <div style={{ fontSize: 'var(--text-sm)' }}>Added "{justAdded.name}" to your food database.</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-strong)' }}>Log some of it now too?</div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <Input
                          label="Grams eaten"
                          name="ask-log-after-add-grams"
                          type="number"
                          min="0"
                          value={logAfterAddGrams}
                          onChange={(e) => setLogAfterAddGrams(e.target.value)}
                        />
                      </div>
                      <Button onClick={logAfterAdd} disabled={saving || !logAfterAddGrams}>
                        Log it
                      </Button>
                      <Button variant="ghost" onClick={() => resetChat()} disabled={saving}>
                        Skip
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <NutrientFieldsGrid fields={editFields} onChange={updateEditField} namePrefix="ask" />
                    {editFields.intent === 'log_once' ? (
                      <>
                        <Input
                          label="Grams eaten"
                          name="ask-grams"
                          type="number"
                          min="0"
                          value={gramsEaten}
                          onChange={(e) => setGramsEaten(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                          <Button onClick={logOnce} disabled={saving || !gramsEaten}>
                            Log it
                          </Button>
                          <Button variant="ghost" onClick={() => resetChat()} disabled={saving}>
                            Start over
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <Button onClick={addPermanent} disabled={saving || !editFields?.name?.trim()}>
                          Add to my food database
                        </Button>
                        <Button variant="ghost" onClick={() => resetChat()} disabled={saving}>
                          Start over
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          }
          return (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                background: m.role === 'user' ? 'var(--accent)' : 'var(--card)',
                color: m.role === 'user' ? 'var(--on-accent)' : 'var(--fg)',
                fontSize: 'var(--text-sm)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.text}
            </div>
          )
        })}
        {sending && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Thinking…</div>}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>
          <Input
            name="ask-chat-input"
            placeholder='e.g. "I ate 4 smores tonight, graham cracker, marshmallow, and a square of chocolate each"'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
            disabled={sending}
          />
        </div>
        <Button onClick={() => send()} disabled={sending || !input.trim()}>
          Send
        </Button>
      </div>

      {error && <span className="dk-field__error">{error}</span>}
    </>
  )
}
