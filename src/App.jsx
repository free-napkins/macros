import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { useSession } from './lib/SessionContext.jsx'
import { PageShell } from './design-kit.tsx'
import Auth from './components/Auth.jsx'
import Onboarding from './components/Onboarding.jsx'
import Nav from './components/Nav.jsx'
import AdaptiveGoalBanner from './components/AdaptiveGoalBanner.jsx'
import TodayTotals from './components/TodayTotals.jsx'
import LogWeight from './components/LogWeight.jsx'
import QuickAdd from './components/QuickAdd.jsx'
import Recipes from './components/Recipes.jsx'
import SupplementChecklist from './components/SupplementChecklist.jsx'
import HistoryCalendar from './components/HistoryCalendar.jsx'
import Reveal from './components/Reveal.jsx'
import { UnitProvider } from './lib/UnitContext.jsx'

export default function App() {
  const session = useSession()
  const [refreshKey, setRefreshKey] = useState(0)
  const [hasProfile, setHasProfile] = useState(null) // null = loading
  const [page, setPage] = useState('today')
  const logged = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    if (!session) return
    supabase
      .from('profile')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1)
      .then(({ data }) => setHasProfile(Boolean(data && data.length)))
  }, [session, refreshKey])

  if (session === undefined) {
    return <PageShell><div /></PageShell>
  }

  if (session === null) {
    return <PageShell><Auth /></PageShell>
  }

  if (hasProfile === null) {
    return <PageShell><div /></PageShell>
  }

  if (!hasProfile) {
    return (
      <PageShell>
        <UnitProvider>
          <Onboarding onComplete={logged} />
        </UnitProvider>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <UnitProvider refreshKey={refreshKey}>
      <Nav page={page} onChange={setPage} />

      {page === 'today' && (
        <>
          <AdaptiveGoalBanner onAdjusted={logged} />
          <Reveal><TodayTotals refreshKey={refreshKey} /></Reveal>
          <Reveal><LogWeight onLogged={logged} /></Reveal>
          <Reveal><QuickAdd onLogged={logged} /></Reveal>
          <Reveal><Recipes onLogged={logged} /></Reveal>
          <Reveal><SupplementChecklist /></Reveal>
        </>
      )}

      {page === 'history' && <Reveal><HistoryCalendar /></Reveal>}
      </UnitProvider>
    </PageShell>
  )
}
