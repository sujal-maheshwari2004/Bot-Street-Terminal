import { getOrderBook } from '../api/client'
import { usePolling } from '../hooks/usePolling'

function Row({ level, side, maxQty }) {
  const pct = Math.min((level.quantity / maxQty) * 100, 100)
  const isBid = side === 'bid'
  const color = isBid ? 'var(--green)' : 'var(--red)'
  const fill = isBid ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 61, 61, 0.08)'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        padding: '8px 14px',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${pct}%`,
          left: isBid ? 'auto' : 0,
          right: isBid ? 0 : 'auto',
          background: fill,
          transition: 'width 0.25s ease',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 600,
          color,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {level.price.toFixed(2)}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text-primary)',
          textAlign: 'right',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {level.quantity.toLocaleString('en-US')}
      </span>
    </div>
  )
}

function EmptyBook({ side }) {
  const color = side === 'ask' ? 'var(--red)' : 'var(--green)'

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
      }}
    >
      <div style={{ width: 34, height: 2, background: color, opacity: 0.4 }} />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
        }}
      >
        NO {side === 'ask' ? 'ASKS' : 'BIDS'}
      </span>
    </div>
  )
}

function SkeletonRows({ count }) {
  return (
    <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="skeleton"
          style={{ height: 16, width: `${58 + ((index * 9) % 34)}%`, borderRadius: 4 }}
        />
      ))}
    </div>
  )
}

export default function OrderBook({ symbol }) {
  const { data, loading } = usePolling(() => getOrderBook(symbol, 8), 1500, [symbol])

  const bids = data?.bids || []
  const asks = data?.asks || []
  const maxQty = Math.max(...[...bids, ...asks].map((level) => level.quantity), 1)
  const hasData = bids.length > 0 || asks.length > 0

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="panel-header">
        <span className="panel-title">Order Book</span>
        {data && hasData && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--cyan)' }}>
            spread {data.spread?.toFixed(4) ?? '--'}
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          padding: '10px 14px 8px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(8, 12, 18, 0.65)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Price
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textAlign: 'right',
          }}
        >
          Size
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {loading
          ? <SkeletonRows count={5} />
          : asks.length > 0
            ? [...asks].reverse().map((ask, index) => (
              <Row key={`${ask.price}-${index}`} level={ask} side="ask" maxQty={maxQty} />
            ))
            : <EmptyBook side="ask" />
        }
      </div>

      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-panel-3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Mid Price
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 20,
            fontWeight: 700,
            color: data?.mid ? 'var(--text-primary)' : 'var(--text-muted)',
          }}
        >
          {data?.mid ? `$${data.mid.toFixed(2)}` : '--'}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>USD</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {loading
          ? <SkeletonRows count={5} />
          : bids.length > 0
            ? bids.map((bid, index) => (
              <Row key={`${bid.price}-${index}`} level={bid} side="bid" maxQty={maxQty} />
            ))
            : <EmptyBook side="bid" />
        }
      </div>

      {!loading && !hasData && (
        <div
          style={{
            padding: '8px 14px',
            borderTop: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textAlign: 'center',
          }}
        >
          order book is currently unavailable from the upstream engine
        </div>
      )}
    </div>
  )
}
