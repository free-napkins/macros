import { useState } from 'react'
import { PageShell } from './design-kit.tsx'
import TodayTotals from './components/TodayTotals.jsx'
import QuickAddIngredient from './components/QuickAddIngredient.jsx'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <PageShell>
      <TodayTotals refreshKey={refreshKey} />
      <QuickAddIngredient onLogged={() => setRefreshKey((k) => k + 1)} />
    </PageShell>
  )
}
