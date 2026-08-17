export default function Nav({ page, onChange }) {
  const tabs = [
    { key: 'today', label: 'Today' },
    { key: 'history', label: 'History' },
  ]

  return (
    <nav style={{ display: 'flex', gap: 'var(--space-2)' }}>
      {tabs.map((tab) => {
        const active = page === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={active ? 'dk-btn dk-btn--pill' : 'dk-btn dk-btn--link'}
            style={active ? undefined : { border: '1px solid var(--border)' }}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
