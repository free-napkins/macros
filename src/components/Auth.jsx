import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, Input, Button } from '../design-kit.tsx'

const MODES = [
  { key: 'sign-in', label: 'Sign in' },
  { key: 'sign-up', label: 'Sign up' },
]

export default function Auth() {
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  function switchMode(next) {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || (mode !== 'reset' && !password)) return
    setSaving(true)
    setError(null)
    setMessage(null)

    if (mode === 'sign-in') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      setSaving(false)
      if (error) setError(error.message)
      return
    }

    if (mode === 'sign-up') {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })
      setSaving(false)
      if (error) {
        setError(error.message)
        return
      }
      if (!data.session) {
        setMessage('Check your email to confirm your account, then sign in.')
        setMode('sign-in')
      }
      return
    }

    // reset
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setMessage('Check your email for a password reset link.')
  }

  return (
    <Card eyebrow="Account" title={mode === 'reset' ? 'Reset password' : 'Welcome'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {mode !== 'reset' && (
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: 'fit-content' }}>
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => switchMode(m.key)}
                style={{
                  padding: '6px 14px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: mode === m.key ? 'var(--accent)' : 'transparent',
                  color: mode === m.key ? 'var(--on-accent)' : 'var(--muted)',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode !== 'reset' && (
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          <Button type="submit" disabled={saving}>
            {saving
              ? 'Please wait…'
              : mode === 'sign-in'
              ? 'Sign in'
              : mode === 'sign-up'
              ? 'Create account'
              : 'Send reset link'}
          </Button>

          {mode === 'sign-in' && (
            <Button type="button" variant="link" onClick={() => switchMode('reset')}>
              Forgot password?
            </Button>
          )}
          {mode === 'reset' && (
            <Button type="button" variant="link" onClick={() => switchMode('sign-in')}>
              Back to sign in
            </Button>
          )}

          {message && <span style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-sm)' }}>{message}</span>}
          {error && <span className="dk-field__error">{error}</span>}
        </form>
      </div>
    </Card>
  )
}
