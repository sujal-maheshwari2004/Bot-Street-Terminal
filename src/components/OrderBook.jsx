import { usePolling } from '../hooks/usePolling'
import { getOrderBook } from '../api/client'

export default function OrderBook({ symbol }) {
  const { data, loading } = usePolling(() => getOrderBook(symbol, 8), 1500, [symbol])

  const bids = data?.bids || []
  const asks = data?.asks || []
  const maxQty = Math.max(...[...bids, ...asks].map(l => l.quantity), 1)

  const Row = ({ level, side }) => {
    const pct = (level.quantity / maxQty * 100).toFixed(0)
    const isBid = side === 'bid'
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        padding: '1px 8px',
        position: 'relative',
        cursor: 'default',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          width: pct + '%',
          left: isBid ? 'auto' : 0,
          right: isBid ? 0 : 'auto',
          background: isBid ? 'rgba(0,192,118,0.06)' : 'rgba(255,59,59,0.06)',
        }} />
        <span style={{ color: isBid ? 'var(--green)' : 'var(--red)', fontSize: 10, position: 'relative' }}>
          {level.price.toFixed(2)}
        </span>
        <span style={{ color: 'var(--white)', fontSize: 10, textAlign: 'right', position: 'relative' }}>
          {level.quantity}
        </span>
      </div>
    )
  }

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span>Order Book — {symbol}</span>
        {data && <span style={{ color: 'var(--muted)' }}>spd ${data.spread?.toFixed(3) ?? '—'}</span>}
      </div>

      <div style={{ padding: '2px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <span className="label">price</span>
        <span className="label" style={{ textAlign: 'right' }}>qty</span>
      </div>

      {/* Asks — reversed so highest ask is at top */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {loading ? <Skeleton /> : [...asks].reverse().map((a, i) => <Row key={i} level={a} side="ask" />)}
      </div>

      {/* Spread mid */}
      <div style={{
        padding: '3px 8px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        background: 'var(--bg-panel-2)',
      }}>
        <span className="label">mid</span>
        <span style={{ color: 'var(--amber)', fontSize: 11, fontWeight: 600 }}>
          ${data?.mid?.toFixed(2) ?? '—'}
        </span>
      </div>

      {/* Bids */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {loading ? <Skeleton /> : bids.map((b, i) => <Row key={i} level={b} side="bid" />)}
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ padding: '8px', color: 'var(--muted)', fontSize: 10 }}>
      LOADING...
    </div>
  )
}