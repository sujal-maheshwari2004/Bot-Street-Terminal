import { useEffect, useRef, useState } from 'react'
import { getAllPrices } from '../api/client'
import { usePolling } from '../hooks/usePolling'

const SYMBOLS = ['PEAR', 'TSLA', 'LBRY', 'RNFR', 'MHRD']
const PARTICIPANTS = ['MKT-MKR', 'MOMENTUM', 'RANDOM', 'MEAN-REV']

function useSyntheticFeed(prices) {
  const [trades, setTrades] = useState([])
  const previousPrices = useRef({})
  const tradeId = useRef(0)

  useEffect(() => {
    if (!prices) return

    const now = Date.now()
    const newTrades = []

    SYMBOLS.forEach((symbol) => {
      const previous = previousPrices.current[symbol]
      const current = prices[symbol]

      if (previous && current && previous !== current) {
        const side = current > previous ? 'buy' : 'sell'
        const qty = Math.floor(Math.random() * 18) + 1
        const participant = PARTICIPANTS[Math.floor(Math.random() * PARTICIPANTS.length)]

        newTrades.push({
          id: tradeId.current++,
          ts: now,
          symbol,
          side,
          price: current,
          qty,
          participant,
        })
      }
    })

    if (newTrades.length > 0) {
      setTrades((currentTrades) => [...newTrades, ...currentTrades].slice(0, 80))
    }

    previousPrices.current = { ...prices }
  }, [prices])

  return trades
}

export default function TradeFeed() {
  const { data: prices } = usePolling(getAllPrices, 2000)
  const trades = useSyntheticFeed(prices)

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="panel-header">
        <span className="panel-title">Trade Feed</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>
          LIVE EXECUTIONS
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '88px 82px 90px 72px 96px 1fr',
          gap: 10,
          padding: '10px 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          background: 'rgba(8, 12, 18, 0.65)',
        }}
      >
        {['Time', 'Symbol', 'Action', 'Size', 'Price', 'Participant'].map((heading, index) => (
          <span
            key={heading}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: index >= 2 ? 'right' : 'left',
            }}
          >
            {heading}
          </span>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {trades.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <div className="skeleton" style={{ width: '58%', height: 46, borderRadius: 6 }} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-muted)',
                letterSpacing: '0.12em',
              }}
            >
              WAITING FOR EXECUTIONS
            </span>
          </div>
        ) : trades.map((trade, index) => {
          const isBuy = trade.side === 'buy'
          const time = new Date(trade.ts).toLocaleTimeString('en-GB', { hour12: false })
          const opacity = Math.max(0.38, 1 - (index / trades.length) * 0.55)

          return (
            <div
              key={trade.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '88px 82px 90px 72px 96px 1fr',
                gap: 10,
                padding: '10px 14px',
                alignItems: 'center',
                borderBottom: '1px solid rgba(26, 37, 53, 0.65)',
                opacity,
                background: index === 0
                  ? isBuy
                    ? 'rgba(0, 230, 118, 0.05)'
                    : 'rgba(255, 61, 61, 0.05)'
                  : 'transparent',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                {time}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--amber)' }}>
                {trade.symbol}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: isBuy ? 'var(--green)' : 'var(--red)',
                  textAlign: 'right',
                  letterSpacing: '0.08em',
                }}
              >
                {isBuy ? 'BUY' : 'SELL'}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  textAlign: 'right',
                }}
              >
                {trade.qty.toLocaleString('en-US')}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textAlign: 'right',
                }}
              >
                ${trade.price.toFixed(2)}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  textAlign: 'right',
                  letterSpacing: '0.06em',
                }}
              >
                {trade.participant}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
