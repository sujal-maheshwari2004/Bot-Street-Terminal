import { useEffect, useRef } from 'react'
import { getAllPrices, SYMBOLS } from '../api/client'
import { usePolling } from '../hooks/usePolling'

const COMPANY = {
  PEAR: 'Pear Technologies',
  TSLA: 'TeslaCoil Motors',
  LBRY: 'Labyrinth Search',
  RNFR: 'Rainforest Commerce',
  MHRD: 'Microhard Corp',
}

export default function Ticker({ symbol, onSelect }) {
  const { data: prices, error } = usePolling(getAllPrices, 2000)
  const previousRef = useRef({})
  const previous = previousRef.current
  const current = prices || {}

  useEffect(() => {
    if (prices) {
      previousRef.current = { ...prices }
    }
  }, [prices])

  return (
    <div
      style={{
        height: 'var(--ticker-h)',
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'stretch',
        overflowX: 'auto',
        overflowY: 'hidden',
        flexShrink: 0,
      }}
    >
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 16px',
            color: 'var(--red)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            flexShrink: 0,
          }}
        >
          API UNREACHABLE
        </div>
      )}

      {SYMBOLS.map((item, index) => {
        const price = current[item]
        const previousPrice = previous[item]
        const direction = !previousPrice || price === previousPrice
          ? 'flat'
          : price > previousPrice
            ? 'up'
            : 'down'

        const pct = previousPrice && previousPrice !== 0
          ? ((price - previousPrice) / previousPrice) * 100
          : 0

        const active = item === symbol
        const directionColor = direction === 'up'
          ? 'var(--green)'
          : direction === 'down'
            ? 'var(--red)'
            : 'var(--amber)'

        return (
          <button
            key={item}
            onClick={() => onSelect(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              height: '100%',
              padding: '0 16px',
              background: active ? 'var(--bg-active)' : 'transparent',
              border: 'none',
              borderRight: '1px solid var(--border)',
              borderLeft: index === 0 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              textAlign: 'left',
              transition: 'background 0.15s ease',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {active && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'var(--green)',
                  boxShadow: '0 0 8px var(--green)',
                }}
              />
            )}

            <span
              style={{
                color: active ? 'var(--green)' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
              }}
            >
              {item}
            </span>

            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
              {COMPANY[item]}
            </span>

            {price != null ? (
              <>
                <span style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }}>
                  ${price.toFixed(2)}
                </span>
                <span style={{ color: directionColor, fontSize: 10, letterSpacing: '0.04em' }}>
                  {pct >= 0 ? '+' : ''}
                  {pct.toFixed(2)}%
                </span>
              </>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>--</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
