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

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span>Sentiment — {symbol}</span>
        <span style={{ color: 'var(--muted)' }}>{velocity.toFixed(2)} t/s</span>
      </div>

      {loading || !d ? (
        <div style={{ padding: 8, color: 'var(--muted)', fontSize: 10 }}>LOADING...</div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px 12px', gap: 10 }}>

          {/* Direction label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em' }}>
              {sentiment.toUpperCase()}
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 9 }}>
              STR {(strength * 100).toFixed(0)}%
            </span>
          </div>

          {/* Main gauge bar */}
          <div style={{ position: 'relative', height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              left:     sentiment === 'bearish' ? `${fillPct}%` : '50%',
              width:    `${Math.abs(fillPct - 50)}%`,
              height:   '100%',
              background: color,
              transition: 'all 0.5s',
              borderRadius: 4,
            }} />
            {/* Midline */}
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border-bright)' }} />
          </div>

          {/* Bear / Bull labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--red)', fontSize: 9, letterSpacing: '0.08em' }}>◄ BEAR</span>
            <span style={{ color: 'var(--green)', fontSize: 9, letterSpacing: '0.08em' }}>BULL ►</span>
          </div>

          {/* Buy / Sell ratio bar */}
          <div style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span className="label">buy ratio</span>
              <span style={{ color: 'var(--white)', fontSize: 9 }}>{(buyRatio * 100).toFixed(1)}%</span>
            </div>
            <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: (buyRatio * 100) + '%', background: 'var(--green)', transition: 'width 0.5s' }} />
              <div style={{ flex: 1, background: 'var(--red)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ color: 'var(--green)', fontSize: 9 }}>BUY</span>
              <span style={{ color: 'var(--red)', fontSize: 9 }}>SELL</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="label">velocity</div>
              <div style={{ color: 'var(--cyan)', fontSize: 10 }}>{velocity.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="label">strength</div>
              <div style={{ color, fontSize: 10 }}>{(strength * 100).toFixed(0)}%</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="label">sell ratio</div>
              <div style={{ color: 'var(--red)', fontSize: 10 }}>{((1 - buyRatio) * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}