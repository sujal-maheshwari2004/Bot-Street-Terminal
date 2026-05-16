import { usePolling } from '../hooks/usePolling'
import { getStatus } from '../api/client'

export default function MarketStatus() {
  const { data, loading } = usePolling(getStatus, 5000)

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ width: 6, height: 6, borderRadius: '50%' }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {data.map(s => (
        <div key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: s.halted ? 'var(--red)' : 'var(--green)',
            boxShadow: s.halted
              ? '0 0 5px var(--red)'
              : '0 0 5px var(--green)',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 8,
            color: s.halted ? 'var(--red)' : 'var(--text-muted)',
            letterSpacing: '0.06em',
          }}>
            {s.symbol}
          </span>
        </div>
      ))}
    </div>
  )
}