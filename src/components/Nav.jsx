import { supabase } from '../lib/supabaseClient'
import { useSession } from '../lib/SessionContext.jsx'
import { useUnitSystem } from '../lib/UnitContext.jsx'

export default function Nav({ page, onChange }) {
  const tabs = [
    { key: 'today', label: 'Today' },
    { key: 'history', label: 'History' },
    { key: 'design', label: 'Design Lab' },
  ]
  const session = useSession()
  const { unitSystem, setUnitSystem } = useUnitSystem()

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        {tabs.map((tab) => {
          const active = page === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={active ? 'dk-btn dk-btn--pill' : 'dk-btn dk-btn--link'}
              style={active ? undefined : { border: '1px solid var(--border)' }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
          {['metric', 'imperial'].map((sys) => (
            <button
              key={sys}
              type="button"
              onClick={() => setUnitSystem(sys)}
              title={sys === 'metric' ? 'Switch to kg / cm' : 'Switch to lb / ft-in'}
              style={{
                padding: '6px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
                background: unitSystem === sys ? 'var(--accent)' : 'transparent',
                color: unitSystem === sys ? 'var(--on-accent)' : 'var(--muted)',
              }}
            >
              {sys === 'metric' ? 'kg' : 'lb'}
            </button>
          ))}
        </div>

        {session && (
          <>
            <a href={window.BoxAuth.accountUrl} className="dk-btn dk-btn--link" title={session.user.email}>
              Account
            </a>
            <button
              type="button"
              onClick={async () => {
                // Signs out of every boxofjelly.xyz app on this device (shared session).
                window.__boxSigningOut = true
                await supabase.auth.signOut({ scope: 'local' })
                window.location.replace(window.BoxAuth.accountsOrigin + '/')
              }}
              className="dk-btn dk-btn--link"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
