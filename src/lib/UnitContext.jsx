import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useSession } from './SessionContext.jsx'

const UnitContext = createContext({ unitSystem: 'metric', setUnitSystem: () => {}, ready: false })

export function UnitProvider({ children, refreshKey = 0 }) {
  const session = useSession()
  const [unitSystem, setUnitSystemState] = useState('metric')
  const [profileId, setProfileId] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!session) return
    supabase
      .from('profile')
      .select('id, unit_system')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfileId(data.id)
          if (data.unit_system) setUnitSystemState(data.unit_system)
        }
        setReady(true)
      })
  }, [session, refreshKey])

  async function setUnitSystem(next) {
    setUnitSystemState(next)
    if (profileId) {
      await supabase.from('profile').update({ unit_system: next }).eq('id', profileId)
    }
  }

  return (
    <UnitContext.Provider value={{ unitSystem, setUnitSystem, ready }}>
      {children}
    </UnitContext.Provider>
  )
}

export function useUnitSystem() {
  return useContext(UnitContext)
}
