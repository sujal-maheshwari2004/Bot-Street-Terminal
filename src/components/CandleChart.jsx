import { usePolling } from '../hooks/usePolling'
import { getCandles } from '../api/client'
import { useRef, useEffect, useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ReferenceLine
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  const bull = d.close >= d.open
  const change = ((d.close - d.open) / d.open * 100).toFixed(2)
  return (
    <div style={{
      background: 'var(--bg-panel-2)', border: '1px solid var(--border-bright)',
      padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 10,
      borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', minWidth: 140,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: bull ? 'var(--green)' : 'var(--red)', fontSize: 9 }}>{bull ? '▲' : '▼'}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 9 }}>{d.symbol}</span>
        <span style={{ color: bull ? 'var(--green)' : 'var(--red)', marginLeft: 'auto' }}>{bull ? '+' : ''}{change}%</span>
      </div>
      {[['OPEN', d.open], ['HIGH', d.high], ['LOW', d.low], ['CLOSE', d.close]].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
          <span style={{ color: 'var(--text-muted)' }}>{k}</span>
          <span style={{ color: 'var(--text-primary)' }}>${v?.toFixed(2)}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text-muted)' }}>VOL</span>
        <span style={{ color: 'var(--cyan)' }}>{d.volume?.toLocaleString()}</span>
      </div>
    </div>
  )
}

function WickShape({ x, y, width, height, payload }) {
  if (!payload) return null
  return <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} stroke={payload.bullish ? 'var(--green)' : 'var(--red)'} strokeWidth={1} opacity={0.5} />
}

function BodyShape({ x, y, width, height, payload }) {
  if (!payload) return null
  const color = payload.bullish ? 'var(--green)' : 'var(--red)'
  const fill  = payload.bullish ? 'rgba(0,230,118,0.18)' : 'rgba(255,61,61,0.18)'
  return <rect x={x + 1} y={y} width={Math.max(width - 2, 1)} height={Math.max(height, 1)} fill={fill} stroke={color} strokeWidth={1} rx={1} />
}

// Measures its container and returns [width, height] in pixels
function useSize(ref) {
  const [size, setSize] = useState([0, 0])
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setSize([Math.floor(width), Math.floor(height)])
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])
  return size
}

export default function CandleChart({ symbol }) {
  const { data: candles, loading } = usePolling(() => getCandles(symbol, 50), 3000, [symbol])
  const containerRef = useRef(null)
  const [w, h] = useSize(containerRef)

  const chartData = (candles || []).map((c, i) => ({
    ...c, i,
    bullish: c.close >= c.open,
    body: [Math.min(c.open, c.close), Math.max(c.open, c.close)],
    wick: [c.low, c.high],
  }))

  const prices   = chartData.flatMap(c => [c.high, c.low]).filter(Boolean)
  const minPrice = prices.length ? Math.min(...prices) * 0.9995 : 0
  const maxPrice = prices.length ? Math.max(...prices) * 1.0005 : 0
  const last     = candles?.[candles.length - 1]
  const prev     = candles?.[candles.length - 2]
  const dir      = last && prev ? (last.close >= prev.close ? 'up' : 'down') : 'flat'
  const pct      = last && prev && prev.close ? ((last.close - prev.close) / prev.close * 100).toFixed(2) : '0.00'
  const dirColor = dir === 'up' ? 'var(--green)' : dir === 'down' ? 'var(--red)' : 'var(--amber)'

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="panel-title">{symbol} / USD</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', background: 'var(--bg-panel-3)', padding: '1px 5px', borderRadius: 2 }}>10s</span>
        </div>
        {last && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>${last.close.toFixed(2)}</span>
            <span className={`badge ${dir}`}>{dir === 'up' ? '▲' : dir === 'down' ? '▼' : '–'} {pct}%</span>
          </div>
        )}
      </div>

      {/* Chart area — ref measured, explicit px dimensions passed to Recharts */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', padding: '10px 0 6px' }}>
        {loading || !chartData.length ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ width: '60%', height: 60, borderRadius: 4 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>AWAITING CANDLES...</div>
          </div>
        ) : w > 0 && h > 0 ? (
          <ComposedChart width={w} height={h - 16} data={chartData} margin={{ left: 4, right: 56, top: 4, bottom: 4 }}>
            <XAxis dataKey="i" hide />
            <YAxis
              domain={[minPrice, maxPrice]}
              orientation="right"
              tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickFormatter={v => v.toFixed(2)}
              width={52} axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-bright)', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Bar dataKey="wick" shape={<WickShape />} isAnimationActive={false} />
            <Bar dataKey="body" shape={<BodyShape />} isAnimationActive={false} />
            <Line dataKey="vwap" dot={false} strokeWidth={1} stroke="var(--amber)" strokeDasharray="4 4" isAnimationActive={false} opacity={0.7} />
            {last && <ReferenceLine y={last.close} stroke={dirColor} strokeDasharray="2 6" strokeWidth={1} opacity={0.6} />}
          </ComposedChart>
        ) : null}
      </div>

      {/* Legend */}
      <div style={{ padding: '4px 14px 6px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 20, height: 1, borderTop: '1px dashed var(--amber)', opacity: 0.7 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>VWAP</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>{chartData.length} candles</span>
        {last?.vwap && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--amber)', marginLeft: 'auto' }}>VWAP ${last.vwap.toFixed(2)}</span>}
      </div>
    </div>
  )
}