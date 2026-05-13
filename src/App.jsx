import { useState } from 'react'
import Ticker from './components/Ticker'
import OrderBook from './components/OrderBook'
import CandleChart from './components/CandleChart'
import Indicators from './components/Indicators'
import SentimentGauge from './components/SentimentGauge'
import Leaderboard from './components/Leaderboard'
import OrderPanel from './components/OrderPanel'
import MarketStatus from './components/MarketStatus'
import Docs from './pages/Docs'
import { SYMBOLS } from './api/client'

export default function App() {
  const [symbol, setSymbol] = useState('PEAR')
  const [page, setPage]     = useState('terminal') // 'terminal' | 'docs'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div className="scanlines" />

      {/* Header */}
      <header style={{
        height: 'var(--header-h)',
        background: 'var(--bg-panel-2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: 13,
            color: 'var(--amber)',
            letterSpacing: '0.15em',
          }}>
            BOT STREET<span className="cursor" />
          </span>
          <span style={{ color: 'var(--muted)', fontSize: 9, letterSpacing: '0.1em' }}>
            TERMINAL v0.1.0 — THE WORLD'S LEAST REGULATED MARKET
          </span>
        </div>

        <nav style={{ display: 'flex', gap: 4 }}>
          {['terminal', 'docs'].map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              background:   page === p ? 'var(--amber)' : 'transparent',
              color:        page === p ? '#000' : 'var(--muted)',
              border:       '1px solid ' + (page === p ? 'var(--amber)' : 'var(--border)'),
              fontFamily:   'var(--font-mono)',
              fontSize:     9,
              letterSpacing:'0.1em',
              textTransform:'uppercase',
              padding:      '3px 10px',
              cursor:       'pointer',
            }}>
              {p}
            </button>
          ))}
        </nav>

        <MarketStatus />
      </header>

      {/* Ticker bar */}
      <Ticker symbol={symbol} onSelect={setSymbol} />

      {page === 'docs' ? <Docs /> : (
        <>
          {/* Symbol tabs */}
          <div style={{
            display: 'flex',
            gap: 2,
            padding: '4px 8px',
            background: 'var(--bg-panel-2)',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            {SYMBOLS.map(s => (
              <button key={s} onClick={() => setSymbol(s)} style={{
                background:    symbol === s ? 'var(--bg-hover)' : 'transparent',
                color:         symbol === s ? 'var(--amber)' : 'var(--muted)',
                border:        '1px solid ' + (symbol === s ? 'var(--border-bright)' : 'transparent'),
                fontFamily:    'var(--font-mono)',
                fontSize:      10,
                padding:       '2px 10px',
                cursor:        'pointer',
                letterSpacing: '0.08em',
              }}>
                {s}
              </button>
            ))}
          </div>

          {/* Main grid */}
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '220px 1fr 220px',
            gridTemplateRows: '1fr 160px',
            gap: 2,
            padding: 2,
            overflow: 'hidden',
            background: 'var(--border)',
          }}>
            {/* Col 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ flex: 1 }}><OrderBook symbol={symbol} /></div>
              <div style={{ flex: 1 }}><SentimentGauge symbol={symbol} /></div>
            </div>

            {/* Col 2 — main chart + indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ flex: 1 }}><CandleChart symbol={symbol} /></div>
              <div><Indicators symbol={symbol} /></div>
            </div>

            {/* Col 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ flex: 1 }}><Leaderboard /></div>
              <div><OrderPanel symbol={symbol} /></div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}