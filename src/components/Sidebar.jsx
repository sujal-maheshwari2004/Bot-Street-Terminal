const NAV = [
  {
    id: 'terminal',
    label: 'Terminal',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <path d="M5 7l3 2.5L5 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 12h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'docs',
    label: 'API Docs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M4 2h7l3 3v11a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <path d="M11 2v4h3M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function Sidebar({ page, onPage }) {
  return (
    <nav style={{
      width: 'var(--sidebar-w)',
      background: 'var(--bg-panel-2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 0',
      gap: 4,
      flexShrink: 0,
    }}>
      {NAV.map(item => {
        const active = page === item.id
        return (
          <button
            key={item.id}
            title={item.label}
            onClick={() => onPage(item.id)}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: active ? 'var(--green-faint)' : 'transparent',
              border: active ? '1px solid var(--green)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              color: active ? 'var(--green)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: active ? '0 0 12px var(--green-glow)' : 'none',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.background = 'var(--bg-hover)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-muted)'
              }
            }}
          >
            {item.icon}
          </button>
        )
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Live indicator */}
      <div style={{
        width: 40,
        height: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      }}>
        <div className="dot live" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>LIVE</span>
      </div>
    </nav>
  )
}