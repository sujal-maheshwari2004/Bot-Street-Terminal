import { getLeaderboard } from '../api/client'
import { usePolling } from '../hooks/usePolling'

const SHORT = {
  user: 'YOU',
  'bot-market-maker': 'MKT-MKR',
  'bot-momentum': 'MOMENTUM',
  'bot-random': 'RANDOM',
  'bot-mean-reversion': 'MEAN-REV',
}

const RANK_COLORS = ['var(--amber)', 'var(--text-secondary)', '#cd7f32']
const MAGNITUDE_SUFFIXES = [
  { value: 1e18, suffix: 'Qi' },
  { value: 1e15, suffix: 'Q' },
  { value: 1e12, suffix: 'T' },
  { value: 1e9, suffix: 'B' },
  { value: 1e6, suffix: 'M' },
  { value: 1e3, suffix: 'K' },
]

function toFiniteNumber(value) {
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function formatScaled(value) {
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2
  return value.toFixed(digits).replace(/\.0+$|(\.\d*[1-9])0+$/, '$1')
}

function formatPnl(value) {
  const numeric = toFiniteNumber(value)
  if (numeric == null) return '--'

  const abs = Math.abs(numeric)
  if (abs < 0.005) return '0.00'
  if (abs >= 1e21) return `${numeric >= 0 ? '+' : '-'}${abs.toExponential(2)}`

  const magnitude = MAGNITUDE_SUFFIXES.find((item) => abs >= item.value)
  if (magnitude) {
    return `${numeric >= 0 ? '+' : '-'}${formatScaled(abs / magnitude.value)}${magnitude.suffix}`
  }

  return `${numeric >= 0 ? '+' : ''}${numeric.toFixed(2)}`
}

function formatSharpe(value) {
  const numeric = toFiniteNumber(value)
  if (numeric == null) return '--'
  if (Math.abs(numeric) < 0.005) return '0.00'
  return numeric.toFixed(2)
}

export default function Leaderboard() {
  const { data, loading } = usePolling(getLeaderboard, 3000)
  const user = data?.find((row) => row.client_id === 'user')

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="panel-header">
        <span className="panel-title">Leaderboard</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>
          NET P&L
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '34px minmax(0, 1fr) 124px 68px',
          gap: 10,
          padding: '10px 14px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(8, 12, 18, 0.65)',
          flexShrink: 0,
        }}
      >
        {['#', 'Trader', 'P&L', 'Sharpe'].map((heading, index) => (
          <span
            key={heading}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: index > 1 ? 'right' : 'left',
            }}
          >
            {heading}
          </span>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {loading || !data ? (
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[92, 80, 88, 74, 84].map((width, index) => (
              <div key={index} className="skeleton" style={{ height: 42, width: `${width}%`, borderRadius: 6 }} />
            ))}
          </div>
        ) : data.map((row, index) => {
          const pnl = toFiniteNumber(row.total_pnl)
          const isUser = row.client_id === 'user'
          const pnlColor = pnl > 0 ? 'var(--green)' : pnl < 0 ? 'var(--red)' : 'var(--amber)'

          return (
            <div
              key={row.client_id}
              style={{
                display: 'grid',
                gridTemplateColumns: '34px minmax(0, 1fr) 124px 68px',
                gap: 10,
                padding: '12px 14px',
                alignItems: 'center',
                borderBottom: '1px solid rgba(26, 37, 53, 0.7)',
                background: isUser ? 'rgba(0, 230, 118, 0.05)' : 'transparent',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: RANK_COLORS[index] ?? 'var(--text-muted)',
                }}
              >
                {index + 1}
              </span>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: isUser ? 700 : 600,
                    color: isUser ? 'var(--green)' : 'var(--text-primary)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {SHORT[row.client_id] ?? row.client_id}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
                  {isUser ? 'active account' : 'automated strategy'}
                </div>
              </div>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: pnlColor,
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatPnl(row.total_pnl)}
              </span>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  textAlign: 'right',
                }}
              >
                {formatSharpe(row.sharpe)}
              </span>
            </div>
          )
        })}
      </div>

      {user && (
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-panel-2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Your Cash
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--green)',
            }}
          >
            {(() => {
              const cash = toFiniteNumber(user.cash)
              return cash == null
                ? '--'
                : `$${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            })()}
          </span>
        </div>
      )}
    </div>
  )
}
