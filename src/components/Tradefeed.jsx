import { useState, useEffect, useRef } from 'react'
import { usePolling } from '../hooks/usePolling'
import { getLeaderboard, getAllPrices } from '../api/client'

const SHORT = {
  'user':               'YOU',
  'bot-market-maker':   'MKT-MKR',
  'bot-momentum':       'MOMENTUM',
  'bot-random':         'RANDOM',
  'bot-mean-reversion': 'MEAN-REV',
}

// Simulate trade feed from price deltas since we don't have a trades endpoint
// In a real setup this would be GET /trades or a websocket
function useSyntheticFeed(prices) {
  const [trades, setTrades] = useState([])
  const prevPrices = useRef({})
  const SYMBOLS = ['PEAR', 'TSLA', 'LBRY', 'RNFR', 'MHRD']
  const BOTS = ['MKT-MKR', 'MOMENTUM', 'RANDOM', 'MEAN-REV']
  const id = useRef(0)

  useEffect(() => {
    if (!prices) return
    const now = Date.now()
    const newTrades = []

    SYMBOLS.forEach(sym => {
      const prev = prevPrices.current[sym]
      const curr = prices[sym]
      if (prev && curr && prev !== curr) {
        const side = curr > prev ? 'buy' : 'sell'
        const qty = Math.floor(Math.random() * 15) + 1
        const bot = BOTS[Math.floor(Math.random() * BOTS.length)]
        newTrades.push({
          id: id.current++,
          ts: now,
          symbol: sym,
          side,
          price: curr,
          qty,
          participant: bot,
        })
      }
    })

    if (newTrades.length > 0) {
      setTrades(prev => [...newTrades, ...prev].slice(0, 60))
    }

    prevPrices.current = { ...prices }
  }, [prices])

  return trades
}

export default function TradeFeed() {
  const { data: prices } = usePolling(getAllPrices, 2000)
  const trades = useSyntheticFeed(prices)
  const feedRef = useRef(null)

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span className="panel-title">Trade Feed</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>
          LIVE EXECUTIONS
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '52px 60px 70px 50px 80px 1fr',
        padding: '3px 12px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {['TIME', 'SYMBOL', 'SIDE', 'QTY', 'PRICE', 'PARTICIPANT'].map((h, i) => (
          <span key={h} style={{
            fontFamily: 'var(--font-mono)', fontSize: 7,
            color: 'var(--text-muted)', letterSpacing: '0.1em',
            textAlign: i >= 2 ? 'right' : 'left',
          }}>{h}</span>
        ))}
      </div>

      {/* Feed rows */}
      <div ref={feedRef} style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {trades.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
              AWAITING EXECUTIONS...
            </span>
          </div>
        ) : trades.map((t, i) => {
          const isBuy = t.side === 'buy'
          const age = Date.now() - t.ts
          const opacity = Math.max(0.3, 1 - (i / trades.length) * 0.7)
          const d = new Date(t.ts)
          const timeStr = d.toTimeString().slice(0, 8)

          return (
            <div key={t.id} style={{
              display: 'grid',
              gridTemplateColumns: '52px 60px 70px 50px 80px 1fr',
              padding: '2px 12px',
              alignItems: 'center',
              borderBottom: '1px solid rgba(26,37,53,0.5)',
              opacity,
              background: i === 0
                ? isBuy ? 'rgba(0,230,118,0.04)' : 'rgba(255,61,61,0.04)'
                : 'transparent',
              transition: 'opacity 0.5s',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>
                {timeStr}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, color: 'var(--amber)' }}>
                {t.symbol}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
                color: isBuy ? 'var(--green)' : 'var(--red)',
                textAlign: 'right', letterSpacing: '0.1em',
              }}>
                {isBuy ? '▲ BUY' : '▼ SELL'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)', textAlign: 'right' }}>
                {t.qty}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right' }}>
                ${t.price.toFixed(2)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', textAlign: 'right', letterSpacing: '0.06em' }}>
                {t.participant}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}