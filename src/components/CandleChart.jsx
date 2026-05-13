import { usePolling } from '../hooks/usePolling'
import { getCandles } from '../api/client'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  const bull = d.close >= d.open
  return (
    <div style={{
      background: 'var(--bg-panel-2)',
      border: '1px solid var(--border-bright)',
      padding: '6px 10px',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
    }}>
      <div style={{ color: bull ? 'var(--green)' : 'var(--red)', marginBottom: 4, fontWeight: 600 }}>
        {bull ? '▲' : '▼'} {d.symbol}
      </div>
      {[['O', d.open], ['H', d.high], ['L', d.low], ['C', d.close]].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--muted)' }}>{k}</span>
          <span style={{ color: 'var(--white)' }}>${v?.toFixed(2)}</span>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 4, borderTop: '1px solid var(--border)', paddingTop: 4 }}>
        <span style={{ color: 'var(--muted)' }}>VOL</span>
        <span style={{ color: 'var(--cyan)' }}>{d.volume}</span>
      </div>
    </div>
  )
}

export default function CandleChart({ symbol }) {
  const { data: candles, loading } = usePolling(() => getCandles(symbol, 40), 3000, [symbol])

  const chartData = (candles || []).map((c, i) => ({
    ...c,
    i,
    bullish: c.close >= c.open,
    body:    [Math.min(c.open, c.close), Math.max(c.open, c.close)],
    wick:    [c.low, c.high],
  }))

  const prices   = chartData.flatMap(c => [c.high, c.low]).filter(Boolean)
  const minPrice = prices.length ? Math.min(...prices) * 0.9995 : 0
  const maxPrice = prices.length ? Math.max(...prices) * 1.0005 : 0
  const last     = candles?.[candles.length - 1]
  const prev     = candles?.[candles.length - 2]
  const dir      = last && prev ? (last.close >= prev.close ? 'up' : 'down') : 'flat'
  const pct      = last && prev && prev.close
    ? ((last.close - prev.close) / prev.close * 100).toFixed(2)
    : '0.00'

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span>{symbol} / USD &nbsp;·&nbsp; 10s</span>
        <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {last && (
            <>
              <span style={{ color: 'var(--white)', fontSize: 11, fontWeight: 600 }}>
                ${last.close.toFixed(2)}
              </span>
              <span style={{ color: dir === 'up' ? 'var(--green)' : dir === 'down' ? 'var(--red)' : 'var(--amber)', fontSize: 10 }}>
                {dir === 'up' ? '▲' : dir === 'down' ? '▼' : '─'} {pct}%
              </span>
            </>
          )}
        </span>
      </div>

      {loading || !chartData.length ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 10 }}>
          AWAITING CANDLES...
        </div>
      ) : (
        <div style={{ flex: 1, padding: '8px 0 4px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ left: 4, right: 50, top: 4, bottom: 4 }}>
              <XAxis dataKey="i" hide />
              <YAxis
                domain={[minPrice, maxPrice]}
                orientation="right"
                tick={{ fill: '#444', fontSize: 9, fontFamily: 'IBM Plex Mono' }}
                tickFormatter={v => v.toFixed(2)}
                width={48}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-bright)', strokeWidth: 1 }} />

              {/* Wicks */}
              <Bar dataKey="wick" shape={<WickShape />} isAnimationActive={false} />

              {/* Bodies */}
              <Bar dataKey="body" shape={<BodyShape />} isAnimationActive={false} />

              {/* VWAP line */}
              <Line
                dataKey="vwap"
                dot={false}
                strokeWidth={1}
                stroke="var(--amber)"
                strokeDasharray="3 3"
                isAnimationActive={false}
              />

              {/* Last price reference */}
              {last && (
                <ReferenceLine
                  y={last.close}
                  stroke={dir === 'up' ? 'var(--green)' : 'var(--red)'}
                  strokeDasharray="2 4"
                  strokeWidth={1}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function WickShape({ x, y, width, height, payload }) {
  if (!payload) return null
  return (
    <line
      x1={x + width / 2}
      y1={y}
      x2={x + width / 2}
      y2={y + height}
      stroke={payload.bullish ? 'var(--green)' : 'var(--red)'}
      strokeWidth={1}
      opacity={0.6}
    />
  )
}

function BodyShape({ x, y, width, height, payload }) {
  if (!payload) return null
  const color = payload.bullish ? 'var(--green)' : 'var(--red)'
  const h = Math.max(height, 1)
  return (
    <rect
      x={x + 1}
      y={y}
      width={Math.max(width - 2, 1)}
      height={h}
      fill={payload.bullish ? 'rgba(0,192,118,0.25)' : 'rgba(255,59,59,0.25)'}
      stroke={color}
      strokeWidth={1}
    />
  )
}