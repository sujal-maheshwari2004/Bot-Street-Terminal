import { usePolling } from '../hooks/usePolling'
import { getStatus } from '../api/client'

export default function MarketStatus() {
  const { data, loading } = usePolling(getStatus, 5000)

  if (loading || !data) return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border)' }} />
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {data.map(s => (
        <div key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   s.halted ? 'var(--red)' : 'var(--green)',
            boxShadow:    s.halted
              ? '0 0 4px var(--red)'
              : '0 0 4px var(--green)',
          }} />
          <span style={{
            fontSize:     9,
            fontFamily:   'var(--font-mono)',
            color:        s.halted ? 'var(--red)' : 'var(--muted)',
            letterSpacing:'0.06em',
          }}>
            {s.symbol}
          </span>
        </div>
      ))}
    </div>
  )
}