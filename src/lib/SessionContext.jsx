import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const SessionContext = createContext(undefined)

export function SessionProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading, null = signed out

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => sub.subscription.unsubscribe()
  }, [])

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}
