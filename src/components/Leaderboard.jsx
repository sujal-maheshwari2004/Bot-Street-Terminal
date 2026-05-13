import { usePolling } from '../hooks/usePolling'
import { getLeaderboard } from '../api/client'

const MEDALS = ['🥇', '🥈', '🥉']

const SHORT = {
  'user':               'USER',
  'bot-market-maker':   'MKT-MKR',
  'bot-momentum':       'MOMENTUM',
  'bot-random':         'RANDOM',
  'bot-mean-reversion': 'MEAN-REV',
}

export default function Leaderboard() {
  const { data, loading } = usePolling(getLeaderboard, 3000)

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span>Leaderboard</span>
        <span style={{ color: 'var(--muted)' }}>P&L ranked</span>
      </div>

      <div style={{ padding: '2px 8px', display: 'grid', gridTemplateColumns: '16px 1fr 70px 50px', gap: 4 }}>
        <span className="label" />
        <span className="label">participant</span>
        <span className="label" style={{ textAlign: 'right' }}>total p&l</span>
        <span className="label" style={{ textAlign: 'right' }}>sharpe</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading || !data ? (
          <div style={{ padding: 8, color: 'var(--muted)', fontSize: 10 }}>LOADING...</div>
        ) : data.map((r, i) => {
          const pnl     = r.total_pnl
          const color   = pnl > 0 ? 'var(--green)' : pnl < 0 ? 'var(--red)' : 'var(--amber)'
          const isUser  = r.client_id === 'user'

          return (
            <div key={r.client_id} style={{
              display:         'grid',
              gridTemplateColumns: '16px 1fr 70px 50px',
              gap:             4,
              padding:         '3px 8px',
              background:      isUser ? 'rgba(240,165,0,0.05)' : 'transparent',
              borderLeft:      isUser ? '2px solid var(--amber)' : '2px solid transparent',
              alignItems:      'center',
            }}>
              <span style={{ fontSize: 10 }}>{MEDALS[i] ?? i + 1}</span>

              <span style={{ fontSize: 10, color: isUser ? 'var(--amber)' : 'var(--white)', letterSpacing: '0.05em' }}>
                {SHORT[r.client_id] ?? r.client_id}
              </span>

              <span style={{ fontSize: 10, color, textAlign: 'right', fontWeight: 600 }}>
                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
              </span>

              <span style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'right' }}>
                {r.sharpe != null ? r.sharpe.toFixed(2) : '—'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Cash footer for user */}
      {data && (() => {
        const user = data.find(r => r.client_id === 'user')
        if (!user) return null
        return (
          <div style={{
            padding: '4px 8px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            background: 'var(--bg-panel-2)',
          }}>
            <span className="label">your cash</span>
            <span style={{ color: 'var(--amber)', fontSize: 10 }}>${user.cash?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        )
      })()}
    </div>
  )
}