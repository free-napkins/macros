import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const SessionContext = createContext(undefined)

// undefined = checking, null = not signed in (on our domains the browser is
// already on its way to accounts.boxofjelly.xyz), otherwise a session that
// passed password + 2FA.
export function SessionProvider({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    let alive = true
    window.BoxAuth.requireSession(supabase).then((s) => { if (alive) setSession(s) })
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
        // The Sign out button redirects itself; this covers expired/revoked sessions.
        if (window.BoxAuth.canSignIn && !window.__boxSigningOut) window.location.replace(window.BoxAuth.signInUrl())
      } else if (next && (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN')) setSession(next)
    })
    // Signed out from another app (the shared cookie is gone): follow suit.
    const onVisible = () => {
      if (!document.hidden && window.BoxAuth.canSignIn && !window.BoxAuth.storage.getItem(window.BoxAuth.storageKey)) {
        window.location.replace(window.BoxAuth.signInUrl())
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => { alive = false; sub.subscription.unsubscribe(); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}
