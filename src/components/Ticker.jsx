import { useEffect, useRef } from 'react'
import { usePolling } from '../hooks/usePolling'
import { getAllPrices, SYMBOLS } from '../api/client'

const COMPANY = {
  PEAR: 'Pear Technologies',
  TSLA: 'TeslaCoil Motors',
  LBRY: 'Labyrinth Search',
  RNFR: 'Rainforest Commerce',
  MHRD: 'Microhard Corp',
}

export default function Ticker({ symbol, onSelect }) {
  const { data: prices, error } = usePolling(getAllPrices, 2000)
  const prevRef = useRef({})
  const prev = prevRef.current
  const current = prices || {}

  useEffect(() => {
    if (prices) prevRef.current = { ...prices }
  }, [prices])

  return (
    <div style={{
      height: 'var(--ticker-h)',
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'stretch',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px',
          color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 9,
        }}>
          <span style={{ fontSize: 12 }}>⚠</span> API UNREACHABLE
        </div>
      )}

      {SYMBOLS.map((s, i) => {
        const price = current[s]
        const p = prev[s]
        const dir = !p || price === p ? 'flat' : price > p ? 'up' : 'down'
        const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '–'
        const pct = p && p !== 0 ? ((price - p) / p * 100).toFixed(2) : '0.00'
        const active = s === symbol
        const dirColor = dir === 'up' ? 'var(--green)' : dir === 'down' ? 'var(--red)' : 'var(--amber)'

        return (
          <button
            key={s}
            onClick={() => onSelect(s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: '100%',
              padding: '0 16px',
              background: active ? 'var(--bg-active)' : 'transparent',
              borderRight: '1px solid var(--border)',
              borderLeft: i === 0 ? '1px solid var(--border)' : 'none',
              border: 'none',
              borderRight: '1px solid var(--border)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              textAlign: 'left',
              transition: 'background 0.15s',
              position: 'relative',
            }}
          >
            {active && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                background: 'var(--green)',
                boxShadow: '0 0 8px var(--green)',
              }} />
            )}

            {/* Symbol */}
            <span style={{
              color: active ? 'var(--green)' : 'var(--text-secondary)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.1em',
            }}>
              {s}
            </span>

            {/* Company abbrev */}
            <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>
              {COMPANY[s].split(' ')[0].slice(0, 5)}
            </span>

            {price != null ? (
              <>
                <span style={{ color: 'var(--text-primary)', fontSize: 11, fontWeight: 500 }}>
                  ${price.toFixed(2)}
                </span>
                <span style={{ color: dirColor, fontSize: 9, letterSpacing: '0.04em' }}>
                  {arrow} {pct}%
                </span>
              </>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>—</span>
            )}
          </button>
        )
      })}
    </div>
  )
}