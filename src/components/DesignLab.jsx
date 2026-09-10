import { useState } from 'react'
import { Button, Card, Input, PosterGrid } from '../design-kit.tsx'

const ART = ['aurora', 'grid', 'dots', 'duotone', 'frosted']
const LABELS = ['Pulse', 'Orbit', 'Signal', 'Bloom', 'Current', 'Drift']

function makePosters(seed = 0, layout = 'editorial') {
  const slots = layout === 'mosaic'
    ? ['square', 'tall', 'wideTop', 'square', 'wideBot', 'square']
    : layout === 'focus'
      ? ['hero', 'square', 'tall', 'wideBot', 'square', 'square']
      : ['hero', 'wideTop', 'tall', 'square', 'wideBot', 'square']
  return slots.map((slot, index) => ({
    id: `${seed}-${index}`,
    slot,
    art: ART[(index + seed) % ART.length],
    label: LABELS[(index + seed) % LABELS.length],
    active: true,
  }))
}

export default function DesignLab() {
  const [gap, setGap] = useState(16)
  const [palette, setPalette] = useState('citrus')
  const [layout, setLayout] = useState('editorial')
  const [seed, setSeed] = useState(0)
  const posters = makePosters(seed, layout)

  function remix() {
    setSeed((value) => value + 1)
    setLayout(['editorial', 'mosaic', 'focus'][Math.floor(Math.random() * 3)])
    setPalette(['citrus', 'neon', 'violet'][Math.floor(Math.random() * 3)])
  }

  return (
    <Card eyebrow="Workspace" title="Design Lab">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 'var(--space-4)', alignItems: 'end' }}>
          <Input label={`Tile spacing: ${gap}px`} name="tile-gap" type="range" min="4" max="36" step="4" value={gap} onChange={(e) => setGap(Number(e.target.value))} />
          <label className="dk-field">
            <span className="dk-field__label">Palette</span>
            <select className="dk-input" value={palette} onChange={(e) => setPalette(e.target.value)}>
              <option value="citrus">Citrus pop</option>
              <option value="neon">Neon glass</option>
              <option value="violet">Violet electric</option>
            </select>
          </label>
          <label className="dk-field">
            <span className="dk-field__label">Layout</span>
            <select className="dk-input" value={layout} onChange={(e) => setLayout(e.target.value)}>
              <option value="editorial">Editorial</option>
              <option value="mosaic">Mosaic</option>
              <option value="focus">Focus</option>
            </select>
          </label>
          <Button onClick={remix}>AI remix</Button>
        </div>
        <PosterGrid posters={posters} gap={gap} palette={palette} />
      </div>
    </Card>
  )
}