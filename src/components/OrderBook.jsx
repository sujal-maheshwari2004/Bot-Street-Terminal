import { usePolling } from '../hooks/usePolling'
import { getOrderBook } from '../api/client'

function Row({ level, side, maxQty }) {
  const pct = Math.min((level.quantity / maxQty) * 100, 100)
  const isBid = side === 'bid'
  const color = isBid ? 'var(--green)' : 'var(--red)'
  const fillColor = isBid ? 'rgba(0,230,118,0.06)' : 'rgba(255,61,61,0.06)'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '3px 12px', position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: 0,
        width: pct + '%',
        left: isBid ? 'auto' : 0,
        right: isBid ? 0 : 'auto',
        background: fillColor,
        transition: 'width 0.3s ease',
      }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color, fontWeight: 500, position: 'relative', zIndex: 1 }}>
        {level.price.toFixed(2)}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-secondary)', textAlign: 'right', position: 'relative', zIndex: 1 }}>
        {level.quantity.toLocaleString()}
      </span>
    </div>
  )
}

function EmptyBook({ side }) {
  const color = side === 'ask' ? 'var(--red)' : 'var(--green)'
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 4,
    }}>
      <div style={{ width: 20, height: 1, background: color, opacity: 0.3 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
        NO {side === 'ask' ? 'ASKS' : 'BIDS'}
      </span>
    </div>
  )
}

export default function OrderBook({ symbol }) {
  const { data, loading } = usePolling(() => getOrderBook(symbol, 8), 1500, [symbol])

  const bids = data?.bids || []
  const asks = data?.asks || []
  const maxQty = Math.max(...[...bids, ...asks].map(l => l.quantity), 1)
  const hasData = bids.length > 0 || asks.length > 0

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span className="panel-title">Order Book</span>
        {data && hasData && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--cyan)' }}>
            spd ${data.spread?.toFixed(3) ?? '—'}
          </span>
        )}
      </div>

      {/* Column labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '4px 12px 2px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>PRICE</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'right' }}>SIZE</span>
      </div>

      {/* Asks */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {loading
          ? <SkeletonRows n={5} />
          : asks.length > 0
            ? [...asks].reverse().map((a, i) => <Row key={i} level={a} side="ask" maxQty={maxQty} />)
            : <EmptyBook side="ask" />
        }
      </div>

      {/* Mid */}
      <div style={{
        padding: '6px 12px',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-panel-3)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mid</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: data?.mid ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {data?.mid ? `$${data.mid.toFixed(2)}` : '—'}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>USD</span>
      </div>

      {/* Bids */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {loading
          ? <SkeletonRows n={5} />
          : bids.length > 0
            ? bids.map((b, i) => <Row key={i} level={b} side="bid" maxQty={maxQty} />)
            : <EmptyBook side="bid" />
        }
      </div>

      {/* Engine note when empty */}
      {!loading && !hasData && (
        <div style={{
          padding: '5px 12px',
          borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)', fontSize: 8,
          color: 'var(--text-muted)', letterSpacing: '0.08em',
          textAlign: 'center',
        }}>
          engine pod not accessible from api pod
        </div>
      )}
    </div>
  )
}

function SkeletonRows({ n }) {
  return (
    <div style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 14, width: `${55 + (i * 7) % 40}%`, borderRadius: 2 }} />
      ))}
    </div>
  )
}