import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { PageShell } from './design-kit.tsx'
import Onboarding from './components/Onboarding.jsx'
import Nav from './components/Nav.jsx'
import AdaptiveGoalBanner from './components/AdaptiveGoalBanner.jsx'
import TodayTotals from './components/TodayTotals.jsx'
import LogWeight from './components/LogWeight.jsx'
import QuickAddIngredient from './components/QuickAddIngredient.jsx'
import ScanFoodLabel from './components/ScanFoodLabel.jsx'
import QuickAddRecipe from './components/QuickAddRecipe.jsx'
import SupplementChecklist from './components/SupplementChecklist.jsx'
import HistoryCalendar from './components/HistoryCalendar.jsx'
import Reveal from './components/Reveal.jsx'
import { UnitProvider } from './lib/UnitContext.jsx'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [hasProfile, setHasProfile] = useState(null) // null = loading
  const [page, setPage] = useState('today')
  const logged = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    supabase
      .from('profile')
      .select('id')
      .limit(1)
      .then(({ data }) => setHasProfile(Boolean(data && data.length)))
  }, [refreshKey])

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
          <Reveal><QuickAddIngredient onLogged={logged} /></Reveal>
          <Reveal><ScanFoodLabel onLogged={logged} /></Reveal>
          <Reveal><QuickAddRecipe onLogged={logged} /></Reveal>
          <Reveal><SupplementChecklist /></Reveal>
        </>
      )}

      {page === 'history' && <Reveal><HistoryCalendar /></Reveal>}
      </UnitProvider>
    </PageShell>
  )
}
