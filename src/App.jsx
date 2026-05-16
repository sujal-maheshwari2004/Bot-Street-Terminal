import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
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
  const [page, setPage] = useState('terminal')
  const [clock, setClock] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const utc = clock.toUTCString().slice(0, 25).toUpperCase()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-void)' }}>
      <div className="scanlines" />

      <Sidebar page={page} onPage={setPage} />

      {/* Main content — minHeight:0 prevents flex children overflowing 100vh */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, minWidth: 0 }}>

        {/* Header */}
        <header style={{
          height: 'var(--header-h)',
          background: 'var(--bg-panel-2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28,
              background: 'var(--green-faint)',
              border: '1px solid var(--green)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 12 L7 2 L12 12 M4 9 h6" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11, color: 'var(--green)', letterSpacing: '0.2em' }}>
                BOT STREET<span className="cursor" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                TERMINAL v0.1.0
              </div>
            </div>
          </div>

          {page === 'terminal' && (
            <div style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center' }}>
              {SYMBOLS.map(s => {
                const active = s === symbol
                return (
                  <button key={s} onClick={() => setSymbol(s)} style={{
                    background: active ? 'var(--bg-active)' : 'transparent',
                    color: active ? 'var(--green)' : 'var(--text-muted)',
                    border: active ? '1px solid var(--border-bright)' : '1px solid transparent',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    fontWeight: active ? 600 : 400,
                    padding: '4px 14px',
                    cursor: 'pointer',
                    letterSpacing: '0.1em',
                    transition: 'all 0.15s',
                    boxShadow: active ? '0 0 10px var(--green-glow)' : 'none',
                  }}>
                    {s}
                  </button>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              {utc} UTC
            </div>
            <MarketStatus />
          </div>
        </header>

        <Ticker symbol={symbol} onSelect={setSymbol} />

        {page === 'docs' ? <Docs /> : (
          /* minHeight:0 is the key fix — grid inside a flex column won't shrink
             below its content size without it, causing overflow below the viewport */
          <div style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: 'grid',
            gridTemplateColumns: '260px 1fr 280px',
            gridTemplateRows: '1fr 180px',
            gap: 3,
            padding: 3,
            overflow: 'hidden',
            background: 'var(--bg-void)',
          }}>
            {/* Col 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden', minHeight: 0 }}>
              <div style={{ flex: 3, minHeight: 0 }}><OrderBook symbol={symbol} /></div>
              <div style={{ flex: 2, minHeight: 0 }}><SentimentGauge symbol={symbol} /></div>
            </div>

            {/* Col 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden', minHeight: 0 }}>
              <div style={{ flex: 1, minHeight: 0 }}><CandleChart symbol={symbol} /></div>
              <div style={{ flexShrink: 0 }}><Indicators symbol={symbol} /></div>
            </div>

            {/* Col 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden', minHeight: 0 }}>
              <div style={{ flex: 1, minHeight: 0 }}><Leaderboard /></div>
              <div style={{ flexShrink: 0 }}><OrderPanel symbol={symbol} /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}