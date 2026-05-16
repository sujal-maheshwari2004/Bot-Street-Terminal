import { getSentiment } from '../api/client'
import { usePolling } from '../hooks/usePolling'

function Stat({ label, value, color }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(36, 51, 72, 0.85)',
        background: 'rgba(8, 12, 18, 0.72)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  )
}

export default function SentimentGauge({ symbol }) {
  const { data, loading } = usePolling(() => getSentiment(symbol), 2000, [symbol])

  const sentiment = data?.sentiment ?? 'neutral'
  const strength = data?.strength ?? 0
  const buyRatio = data?.buy_ratio ?? 0.5
  const velocity = data?.trade_velocity ?? 0

  const color = sentiment === 'bullish'
    ? 'var(--green)'
    : sentiment === 'bearish'
      ? 'var(--red)'
      : 'var(--amber)'

  const fillPct = sentiment === 'bullish'
    ? 50 + strength * 50
    : sentiment === 'bearish'
      ? 50 - strength * 50
      : 50

  const strengthPct = Math.round(strength * 100)
  const sellPct = Math.max(0, 100 - buyRatio * 100)

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="panel-header">
        <span className="panel-title">Sentiment</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>
          {velocity.toFixed(2)} trades/s
        </span>
      </div>

      {loading || !data ? (
        <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[84, 96, 72, 80].map((width, index) => (
            <div key={index} className="skeleton" style={{ height: 16, width: `${width}%`, borderRadius: 4 }} />
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 18,
                  fontWeight: 700,
                  color,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {sentiment}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                live market posture
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color }}>
              {strengthPct}%
            </div>
          </div>

          <div>
            <div
              style={{
                position: 'relative',
                height: 12,
                background: 'var(--bg-panel-3)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: sentiment === 'bearish' ? `${fillPct}%` : '50%',
                  width: `${Math.abs(fillPct - 50)}%`,
                  height: '100%',
                  background: color,
                  transition: 'all 0.6s ease',
                  borderRadius: 999,
                  boxShadow: `0 0 12px ${color}`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: 'var(--border-bright)',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)' }}>Bearish</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)' }}>Bullish</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Buy ratio
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                {(buyRatio * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${buyRatio * 100}%`,
                  background: 'var(--green)',
                  transition: 'width 0.5s ease',
                  boxShadow: '0 0 8px var(--green)',
                }}
              />
              <div style={{ flex: 1, background: 'var(--red)', opacity: 0.7 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 'auto' }}>
            <Stat label="Velocity" value={velocity.toFixed(2)} color="var(--cyan)" />
            <Stat label="Strength" value={`${strengthPct}%`} color={color} />
            <Stat label="Sell Share" value={`${sellPct.toFixed(1)}%`} color="var(--red)" />
          </div>
        </div>
      )}
    </div>
  )
}
