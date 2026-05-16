import { usePolling } from '../hooks/usePolling'
import { getLeaderboard } from '../api/client'

const SHORT = {
  'user':               'YOU',
  'bot-market-maker':   'MKT-MKR',
  'bot-momentum':       'MOMENTUM',
  'bot-random':         'RANDOM',
  'bot-mean-reversion': 'MEAN-REV',
}

const RANK_COLORS = ['var(--amber)', 'var(--text-secondary)', '#cd7f32']

export default function Leaderboard() {
  const { data, loading } = usePolling(getLeaderboard, 3000)
  const user = data?.find(r => r.client_id === 'user')

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span className="panel-title">Leaderboard</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>P&L RANKED</span>
      </div>

      {/* Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '20px 1fr 72px 44px',
        gap: 4,
        padding: '4px 12px',
        borderBottom: '1px solid var(--border)',
      }}>
        {['#', 'PARTICIPANT', 'TOTAL P&L', 'SHARPE'].map((h, i) => (
          <span key={h} style={{
            fontFamily: 'var(--font-mono)', fontSize: 8,
            color: 'var(--text-muted)', letterSpacing: '0.1em',
            textAlign: i > 1 ? 'right' : 'left',
          }}>{h}</span>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading || !data ? (
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[90, 75, 85, 70, 80].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 32, width: `${w}%`, borderRadius: 4 }} />
            ))}
          </div>
        ) : data.map((r, i) => {
          const pnl = r.total_pnl
          const pos = pnl > 0
          const neg = pnl < 0
          const isUser = r.client_id === 'user'

          return (
            <div key={r.client_id} style={{
              display: 'grid',
              gridTemplateColumns: '20px 1fr 72px 44px',
              gap: 4,
              padding: '7px 12px',
              alignItems: 'center',
              background: isUser ? 'rgba(0,230,118,0.04)' : 'transparent',
              borderLeft: isUser ? '2px solid var(--green)' : '2px solid transparent',
              borderBottom: '1px solid var(--border)',
              transition: 'background 0.2s',
            }}>
              {/* Rank */}
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                color: RANK_COLORS[i] ?? 'var(--text-muted)',
              }}>
                {i + 1}
              </span>

              {/* Name */}
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: isUser ? 700 : 500,
                  color: isUser ? 'var(--green)' : 'var(--text-primary)',
                  letterSpacing: '0.06em',
                }}>
                  {SHORT[r.client_id] ?? r.client_id}
                </div>
                {isUser && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--green)', opacity: 0.7, letterSpacing: '0.1em' }}>
                    ACTIVE
                  </div>
                )}
              </div>

              {/* P&L */}
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                  color: pos ? 'var(--green)' : neg ? 'var(--red)' : 'var(--amber)',
                }}>
                  {pos ? '+' : ''}{pnl.toFixed(2)}
                </span>
              </div>

              {/* Sharpe */}
              <div style={{
                textAlign: 'right',
                fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)',
              }}>
                {r.sharpe != null ? r.sharpe.toFixed(2) : '—'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Cash footer */}
      {user && (
        <div style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-panel-2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your Cash</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>
            ${user.cash?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  )
}