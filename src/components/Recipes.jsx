import { useState } from 'react'
import { useSession } from '../lib/SessionContext.jsx'
import { Card } from '../design-kit.tsx'
import RecipeMode from './RecipeMode.jsx'
import MealPrepMode from './MealPrepMode.jsx'
import AskMode from './AskMode.jsx'

const MODES = [
  { key: 'recipe', label: 'Recipe', title: 'Log recipe' },
  { key: 'mealprep', label: 'Meal Prep', title: 'Meal prep' },
  { key: 'ask', label: 'Ask', title: 'Ask AI' },
]

export default function Recipes({ onLogged }) {
  const session = useSession()
  const [mode, setMode] = useState('recipe')
  const active = MODES.find((m) => m.key === mode)

  return (
    <Card eyebrow="Quick add" title={active.title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: 'fit-content' }}>
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
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

        {mode === 'recipe' && <RecipeMode session={session} onLogged={onLogged} />}
        {mode === 'mealprep' && <MealPrepMode session={session} onLogged={onLogged} />}
        {mode === 'ask' && <AskMode session={session} onLogged={onLogged} />}
      </div>
    </Card>
  )
}
