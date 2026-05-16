import { useEffect, useEffectEvent, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import Ticker from './components/Ticker'
import OrderBook from './components/OrderBook'
import CandleChart from './components/CandleChart'
import Indicators from './components/Indicators'
import SentimentGauge from './components/SentimentGauge'
import Leaderboard from './components/Leaderboard'
import OrderPanel from './components/OrderPanel'
import MarketStatus from './components/MarketStatus'
import TradeFeed from './components/TradeFeed'
import Docs from './pages/Docs'
import { SYMBOLS } from './api/client'

const DEFAULT_LAYOUT = {
  leftWidth: 20,
  rightWidth: 22,
  leftTopHeight: 62,
  centerTopHeight: 68,
  orderWidth: 34,
  rightTopHeight: 58,
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function ResizeHandle({ axis, active, label, onPointerDown }) {
  const orientation = axis === 'vertical' ? 'vertical' : 'horizontal'

  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation={orientation}
      className={`resize-handle ${orientation}${active ? ' active' : ''}`}
      onPointerDown={onPointerDown}
    />
  )
}

function useCompactLayout(breakpoint = 1260) {
  const [compact, setCompact] = useState(() => window.innerWidth < breakpoint)

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < breakpoint)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])

  return compact
}

function useResizeSession() {
  const [dragging, setDragging] = useState(null)

  const handleMove = useEffectEvent((event) => {
    dragging?.onMove(event)
  })

  const stopDrag = useEffectEvent(() => {
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    setDragging(null)
  })

  useEffect(() => {
    if (!dragging) return undefined

    document.body.style.cursor = dragging.cursor
    document.body.style.userSelect = 'none'

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', stopDrag)
    window.addEventListener('pointercancel', stopDrag)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', stopDrag)
      window.removeEventListener('pointercancel', stopDrag)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [dragging])

  const beginResize = (config) => (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setDragging(config)
  }

  return {
    activeHandle: dragging?.id ?? null,
    beginResize,
  }
}

export default function App() {
  const [symbol, setSymbol] = useState('PEAR')
  const [page, setPage] = useState('terminal')
  const [clock, setClock] = useState(new Date())
  const [layout, setLayout] = useState(DEFAULT_LAYOUT)
  const isCompact = useCompactLayout()
  const terminalRef = useRef(null)
  const leftRailRef = useRef(null)
  const centerRef = useRef(null)
  const centerBottomRef = useRef(null)
  const rightRailRef = useRef(null)
  const { activeHandle, beginResize } = useResizeSession()

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const utc = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(clock).toUpperCase().replace(',', '')

  const compactWorkspace = (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'auto',
        padding: 12,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gridAutoRows: 'minmax(220px, auto)',
        gap: 12,
        background: 'radial-gradient(circle at top, rgba(0, 230, 118, 0.05), transparent 28%), var(--bg-void)',
      }}
    >
      <div style={{ gridColumn: '1 / -1', minHeight: 420 }}>
        <CandleChart symbol={symbol} />
      </div>
      <div style={{ minHeight: 260 }}>
        <Indicators symbol={symbol} />
      </div>
      <div style={{ minHeight: 280 }}>
        <TradeFeed />
      </div>
      <div style={{ minHeight: 300 }}>
        <OrderBook symbol={symbol} />
      </div>
      <div style={{ minHeight: 260 }}>
        <SentimentGauge symbol={symbol} />
      </div>
      <div style={{ minHeight: 320 }}>
        <Leaderboard />
      </div>
      <div style={{ minHeight: 300 }}>
        <OrderPanel symbol={symbol} />
      </div>
    </div>
  )

  const desktopWorkspace = (
    <div
      ref={terminalRef}
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        padding: 8,
        display: 'flex',
        background: 'radial-gradient(circle at top, rgba(0, 230, 118, 0.05), transparent 28%), var(--bg-void)',
      }}
    >
      <div
        ref={leftRailRef}
        style={{
          flex: `0 0 ${layout.leftWidth}%`,
          minWidth: 240,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ flex: `0 0 ${layout.leftTopHeight}%`, minHeight: 260 }}>
          <OrderBook symbol={symbol} />
        </div>
        <ResizeHandle
          axis="horizontal"
          label="Resize left rail panels"
          active={activeHandle === 'left-vertical'}
          onPointerDown={beginResize({
            id: 'left-vertical',
            cursor: 'row-resize',
            onMove: (event) => {
              const rect = leftRailRef.current?.getBoundingClientRect()
              if (!rect) return

              setLayout((prev) => ({
                ...prev,
                leftTopHeight: clamp(((event.clientY - rect.top) / rect.height) * 100, 38, 76),
              }))
            },
          })}
        />
        <div style={{ flex: 1, minHeight: 220 }}>
          <SentimentGauge symbol={symbol} />
        </div>
      </div>

      <ResizeHandle
        axis="vertical"
        label="Resize left and center panels"
        active={activeHandle === 'left-width'}
        onPointerDown={beginResize({
          id: 'left-width',
          cursor: 'col-resize',
          onMove: (event) => {
            const rect = terminalRef.current?.getBoundingClientRect()
            if (!rect) return

            setLayout((prev) => {
              const maxLeft = Math.min(28, 100 - prev.rightWidth - 32)
              return {
                ...prev,
                leftWidth: clamp(((event.clientX - rect.left) / rect.width) * 100, 16, maxLeft),
              }
            })
          },
        })}
      />

      <div
        ref={centerRef}
        style={{
          flex: 1,
          minWidth: 420,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ flex: `0 0 ${layout.centerTopHeight}%`, minHeight: 360 }}>
          <CandleChart symbol={symbol} />
        </div>
        <ResizeHandle
          axis="horizontal"
          label="Resize chart and lower workspace"
          active={activeHandle === 'center-height'}
          onPointerDown={beginResize({
            id: 'center-height',
            cursor: 'row-resize',
            onMove: (event) => {
              const rect = centerRef.current?.getBoundingClientRect()
              if (!rect) return

              setLayout((prev) => ({
                ...prev,
                centerTopHeight: clamp(((event.clientY - rect.top) / rect.height) * 100, 48, 82),
              }))
            },
          })}
        />
        <div
          ref={centerBottomRef}
          style={{
            flex: 1,
            minHeight: 240,
            minWidth: 0,
            display: 'flex',
            gap: 8,
          }}
        >
          <div style={{ flex: 1, minWidth: 320, minHeight: 0 }}>
            <TradeFeed />
          </div>
          <ResizeHandle
            axis="vertical"
            label="Resize trade feed and order entry"
            active={activeHandle === 'order-width'}
            onPointerDown={beginResize({
              id: 'order-width',
              cursor: 'col-resize',
              onMove: (event) => {
                const rect = centerBottomRef.current?.getBoundingClientRect()
                if (!rect) return

                setLayout((prev) => ({
                  ...prev,
                  orderWidth: clamp(((rect.right - event.clientX) / rect.width) * 100, 28, 46),
                }))
              },
            })}
          />
          <div style={{ flex: `0 0 ${layout.orderWidth}%`, minWidth: 300, minHeight: 0 }}>
            <OrderPanel symbol={symbol} />
          </div>
        </div>
      </div>

      <ResizeHandle
        axis="vertical"
        label="Resize center and right panels"
        active={activeHandle === 'right-width'}
        onPointerDown={beginResize({
          id: 'right-width',
          cursor: 'col-resize',
          onMove: (event) => {
            const rect = terminalRef.current?.getBoundingClientRect()
            if (!rect) return

            setLayout((prev) => {
              const nextWidth = ((rect.right - event.clientX) / rect.width) * 100
              const maxRight = Math.min(30, 100 - prev.leftWidth - 34)
              return {
                ...prev,
                rightWidth: clamp(nextWidth, 18, maxRight),
              }
            })
          },
        })}
      />

      <div
        ref={rightRailRef}
        style={{
          flex: `0 0 ${layout.rightWidth}%`,
          minWidth: 280,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ flex: `0 0 ${layout.rightTopHeight}%`, minHeight: 280 }}>
          <Leaderboard />
        </div>
        <ResizeHandle
          axis="horizontal"
          label="Resize right rail panels"
          active={activeHandle === 'right-vertical'}
          onPointerDown={beginResize({
            id: 'right-vertical',
            cursor: 'row-resize',
            onMove: (event) => {
              const rect = rightRailRef.current?.getBoundingClientRect()
              if (!rect) return

              setLayout((prev) => ({
                ...prev,
                rightTopHeight: clamp(((event.clientY - rect.top) / rect.height) * 100, 42, 72),
              }))
            },
          })}
        />
        <div style={{ flex: 1, minHeight: 240 }}>
          <Indicators symbol={symbol} />
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-void)' }}>
      <div className="scanlines" />
      <Sidebar page={page} onPage={setPage} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          height: 'var(--header-h)', flexShrink: 0,
          background: 'var(--bg-panel-2)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, flexShrink: 0,
              background: 'var(--green-faint)', border: '1px solid var(--green)',
              borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 12 L7 2 L12 12 M4 9 h6" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11, color: 'var(--green)', letterSpacing: '0.2em' }}>
                BOT STREET<span className="cursor" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                CHART-FIRST WORKSPACE
              </div>
            </div>
          </div>

          {page === 'terminal' && (
            <div style={{ display: 'flex', gap: 6, flex: 1, justifyContent: 'center', minWidth: 0, flexWrap: 'wrap' }}>
              {SYMBOLS.map(s => {
                const active = s === symbol
                return (
                  <button key={s} onClick={() => setSymbol(s)} style={{
                    background: active ? 'var(--bg-active)' : 'transparent',
                    color: active ? 'var(--green)' : 'var(--text-muted)',
                    border: active ? '1px solid var(--border-bright)' : '1px solid transparent',
                    borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: active ? 600 : 500, padding: '6px 14px',
                    cursor: 'pointer', letterSpacing: '0.1em', transition: 'all 0.15s',
                    boxShadow: active ? '0 0 10px var(--green-glow)' : 'none',
                  }}>
                    {s}
                  </button>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              {utc} UTC
            </div>
            <MarketStatus />
          </div>
        </header>

        {/* Ticker */}
        <Ticker symbol={symbol} onSelect={setSymbol} />

        {/* Page content */}
        {page === 'docs' ? <Docs /> : (
          isCompact ? compactWorkspace : desktopWorkspace
        )}
      </div>
    </div>
  )
}
