import { useState } from 'react'
import { PageShell } from './design-kit.tsx'
import TodayTotals from './components/TodayTotals.jsx'
import QuickAddIngredient from './components/QuickAddIngredient.jsx'
import QuickAddRecipe from './components/QuickAddRecipe.jsx'
import SupplementChecklist from './components/SupplementChecklist.jsx'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const logged = () => setRefreshKey((k) => k + 1)

  return (
    <PageShell>
      <TodayTotals refreshKey={refreshKey} />
      <QuickAddIngredient onLogged={logged} />
      <QuickAddRecipe onLogged={logged} />
      <SupplementChecklist />
    </PageShell>
  )
}
