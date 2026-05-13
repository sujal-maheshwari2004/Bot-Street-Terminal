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

  const prev    = prevRef.current
  const current = prices || {}

  useEffect(() => {
    if (prices) prevRef.current = { ...prices }
  }, [prices])

  return (
    <div style={{
      height: 'var(--ticker-h)',
      background: 'var(--bg-panel-2)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      flexShrink: 0,
      gap: 0,
    }}>
      {error && (
        <span style={{ color: 'var(--red)', padding: '0 12px', fontSize: 10 }}>
          ⚠ API UNREACHABLE
        </span>
      )}

      {SYMBOLS.map((s, i) => {
        const price = current[s]
        const p     = prev[s]
        const dir   = !p || price === p ? 'flat' : price > p ? 'up' : 'down'
        const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '─'
        const pct   = p && p !== 0 ? ((price - p) / p * 100).toFixed(2) : '0.00'
        const active = s === symbol

        return (
          <button
            key={s}
            onClick={() => onSelect(s)}
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            6,
              height:         '100%',
              padding:        '0 14px',
              background:     active ? 'var(--bg-hover)' : 'transparent',
              borderRight:    '1px solid var(--border)',
              borderLeft:     i === 0 ? '1px solid var(--border)' : 'none',
              border:         'none',
              borderRight:    '1px solid var(--border)',
              cursor:         'pointer',
              fontFamily:     'var(--font-mono)',
              textAlign:      'left',
              transition:     'background 0.15s',
            }}
          >
            <span style={{ color: active ? 'var(--amber)' : 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em' }}>
              {s}
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 9 }}>
              {COMPANY[s].split(' ')[0]}
            </span>
            {price != null && (
              <>
                <span style={{ color: 'var(--white)', fontSize: 10 }}>
                  ${price.toFixed(2)}
                </span>
                <span style={{ color: dir === 'up' ? 'var(--green)' : dir === 'down' ? 'var(--red)' : 'var(--amber)', fontSize: 9 }}>
                  {arrow} {pct}%
                </span>
              </>
            )}
            {price == null && <span style={{ color: 'var(--muted)', fontSize: 9 }}>—</span>}
          </button>
        )
      })}

      <div style={{ marginLeft: 'auto', paddingRight: 12, color: 'var(--muted)', fontSize: 9, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
        {new Date().toUTCString().slice(0, 25).toUpperCase()} UTC
      </div>
    </div>
  )
}