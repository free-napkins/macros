import { NUTRIENT_DEFS, SECTIONS, computeTarget, readNutrientValue } from '../lib/nutrientDefs.js'
import { statusForPercent, STATUS_COLORS } from '../lib/macroCalc.js'

// Already shown as the 4 big bars elsewhere — skip here to avoid duplication.
const SKIP_KEYS = new Set(['core:calories', 'core:protein_g', 'core:carbs_g', 'core:fat_g'])

function fmt(value) {
  const rounded = Math.round(value * 100) / 100
  return rounded % 1 === 0 ? rounded : Math.round(value * 10) / 10
}

// mode "targets": totals vs a computed daily target (bar + %), for nutrients
//   with an established reference value; plain number otherwise. Needs
//   sexWeight = { sex, weightKg } for per-kg amino acid targets.
// mode "values": a single food's per-100g (or per-serving) composition —
//   no targets, just the numbers, since "progress toward a goal" doesn't
//   apply to one food's fixed content.
export default function NutrientSections({ totals, mode = 'targets', sexWeight, hideZero = mode === 'values' }) {
  const defs = NUTRIENT_DEFS.filter((d) => !SKIP_KEYS.has(d.key))

  const sectionsWithRows = SECTIONS.map((section) => {
    let rows = defs.filter((d) => d.section === section)
    if (hideZero) rows = rows.filter((d) => readNutrientValue(d, totals) !== 0)
    return { section, rows }
  }).filter(({ rows }) => rows.length > 0)

  if (hideZero && sectionsWithRows.length === 0) {
    return <span style={{ color: 'var(--muted)', fontSize: '.72rem' }}>No additional nutrient data.</span>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {sectionsWithRows.map(({ section, rows }) => (
        <div key={section}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '.68rem',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {section}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: mode === 'targets' ? 'var(--space-3)' : '4px' }}>
            {rows.map((def) => (
              <NutrientRow key={def.key} def={def} totals={totals} mode={mode} sexWeight={sexWeight} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function NutrientRow({ def, totals, mode, sexWeight }) {
  const value = readNutrientValue(def, totals)
  const target = mode === 'targets' ? computeTarget(def, sexWeight || {}) : null

  if (target) {
    const pct = (value / target) * 100
    const status = statusForPercent(pct)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: '.72rem',
            color: 'var(--muted-strong)',
          }}
        >
          <span>{def.label}</span>
          <span>
            {fmt(value)} / {fmt(target)} {def.unit}
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: Math.min(100, pct) + '%',
              borderRadius: '999px',
              background: STATUS_COLORS[status],
              transition: 'width 600ms cubic-bezier(.16,1,.3,1), background 600ms cubic-bezier(.16,1,.3,1)',
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: '.72rem',
        color: 'var(--muted)',
      }}
    >
      <span>{def.label}</span>
      <span>
        {fmt(value)} {def.unit}
      </span>
    </div>
  )
}
