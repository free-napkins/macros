import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { PageShell } from './design-kit.tsx'
import Onboarding from './components/Onboarding.jsx'
import TodayTotals from './components/TodayTotals.jsx'
import LogWeight from './components/LogWeight.jsx'
import QuickAddIngredient from './components/QuickAddIngredient.jsx'
import ScanFoodLabel from './components/ScanFoodLabel.jsx'
import QuickAddRecipe from './components/QuickAddRecipe.jsx'
import SupplementChecklist from './components/SupplementChecklist.jsx'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [hasProfile, setHasProfile] = useState(null) // null = loading
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
        <Onboarding onComplete={logged} />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <TodayTotals refreshKey={refreshKey} />
      <LogWeight onLogged={logged} />
      <QuickAddIngredient onLogged={logged} />
      <ScanFoodLabel onLogged={logged} />
      <QuickAddRecipe onLogged={logged} />
      <SupplementChecklist />
    </PageShell>
  )
}
