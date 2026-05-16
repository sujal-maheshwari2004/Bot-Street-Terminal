import { usePolling } from '../hooks/usePolling'
import { getSentiment } from '../api/client'

export default function SentimentGauge({ symbol }) {
  const { data: d, loading } = usePolling(() => getSentiment(symbol), 2000, [symbol])

  const sentiment  = d?.sentiment ?? 'neutral'
  const strength   = d?.strength  ?? 0
  const buyRatio   = d?.buy_ratio ?? 0.5
  const velocity   = d?.trade_velocity ?? 0

  const color = sentiment === 'bullish' ? 'var(--green)'
    : sentiment === 'bearish' ? 'var(--red)'
    : 'var(--amber)'

  const fillPct = sentiment === 'bullish' ? 50 + strength * 50
    : sentiment === 'bearish' ? 50 - strength * 50
    : 50

  const strPct = Math.round(strength * 100)

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span className="panel-title">Sentiment</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
          {velocity.toFixed(2)} t/s
        </span>
      </div>

      {loading || !d ? (
        <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[80, 100, 60, 70].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, borderRadius: 2 }} />
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '12px 14px', gap: 12 }}>

          {/* Signal label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
                color, letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                {sentiment}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', marginTop: 2 }}>
                STRENGTH
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700,
              color, opacity: 0.9,
            }}>
              {strPct}%
            </div>
          </div>

          {/* Gauge bar */}
          <div>
            <div style={{
              position: 'relative', height: 10,
              background: 'var(--bg-panel-3)', borderRadius: 5, overflow: 'hidden',
            }}>
              {/* Colored fill */}
              <div style={{
                position: 'absolute',
                left: sentiment === 'bearish' ? `${fillPct}%` : '50%',
                width: `${Math.abs(fillPct - 50)}%`,
                height: '100%',
                background: color,
                transition: 'all 0.6s ease',
                borderRadius: 5,
                boxShadow: `0 0 8px ${color}`,
              }} />
              {/* Midline */}
              <div style={{
                position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1,
                background: 'var(--border-bright)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--red)' }}>◄ BEAR</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--green)' }}>BULL ►</span>
            </div>
          </div>

          {/* Buy/sell ratio */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Buy Ratio
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, color: 'var(--text-primary)' }}>
                {(buyRatio * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: (buyRatio * 100) + '%',
                background: 'var(--green)',
                transition: 'width 0.5s ease',
                boxShadow: '0 0 6px var(--green)',
              }} />
              <div style={{ flex: 1, background: 'var(--red)', opacity: 0.7 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--green)', opacity: 0.7 }}>BUY</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--red)', opacity: 0.7 }}>SELL</span>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            paddingTop: 8, borderTop: '1px solid var(--border)',
            gap: 4,
          }}>
            {[
              ['VEL', velocity.toFixed(2), 'var(--cyan)'],
              ['STR', strPct + '%', color],
              ['SELL', ((1 - buyRatio) * 100).toFixed(1) + '%', 'var(--red)'],
            ].map(([k, v, c]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', marginBottom: 2, letterSpacing: '0.1em' }}>{k}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}