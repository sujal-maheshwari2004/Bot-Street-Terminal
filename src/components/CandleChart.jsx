import { useEffect, useRef, useState } from 'react'
import { ComposedChart, Bar, Line, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { getCandles } from '../api/client'
import { usePolling } from '../hooks/usePolling'

function formatPrice(value) {
  if (value == null) return '--'
  return `$${value.toFixed(2)}`
}

function formatNumber(value) {
  if (value == null) return '--'
  return value.toLocaleString('en-US')
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null

  const candle = payload[0]?.payload
  if (!candle) return null

  const bullish = candle.close >= candle.open
  const change = candle.open
    ? ((candle.close - candle.open) / candle.open) * 100
    : 0

  return (
    <div
      style={{
        minWidth: 180,
        padding: '12px 14px',
        background: 'rgba(11, 16, 24, 0.96)',
        border: '1px solid var(--border-bright)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 14px 30px rgba(0, 0, 0, 0.35)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 10,
          paddingBottom: 10,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
          {candle.symbol} CANDLE {candle.i + 1}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: bullish ? 'var(--green)' : 'var(--red)' }}>
          {change >= 0 ? '+' : ''}
          {change.toFixed(2)}%
        </span>
      </div>

      {[
        ['Open', candle.open],
        ['High', candle.high],
        ['Low', candle.low],
        ['Close', candle.close],
        ['VWAP', candle.vwap],
      ].map(([label, value]) => (
        <div
          key={label}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            marginBottom: 5,
            fontSize: 11,
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span style={{ color: 'var(--text-primary)' }}>{formatPrice(value)}</span>
        </div>
      ))}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginTop: 8,
          paddingTop: 10,
          borderTop: '1px solid var(--border)',
          fontSize: 11,
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>Volume</span>
        <span style={{ color: 'var(--cyan)' }}>{formatNumber(candle.volume)}</span>
      </div>
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
      opacity={0.55}
    />
  )
}

function BodyShape({ x, y, width, height, payload }) {
  if (!payload) return null

  const stroke = payload.bullish ? 'var(--green)' : 'var(--red)'
  const fill = payload.bullish ? 'rgba(0, 230, 118, 0.18)' : 'rgba(255, 61, 61, 0.18)'

  return (
    <rect
      x={x + 1}
      y={y}
      width={Math.max(width - 2, 1)}
      height={Math.max(height, 1)}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.2}
      rx={2}
    />
  )
}

function useSize(ref) {
  const [size, setSize] = useState([0, 0])

  useEffect(() => {
    if (!ref.current) return undefined

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setSize([Math.floor(width), Math.floor(height)])
    })

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])

  return size
}

function StatCard({ label, value, accent = 'var(--text-primary)' }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(36, 51, 72, 0.85)',
        background: 'rgba(8, 12, 18, 0.78)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 15,
          fontWeight: 700,
          color: accent,
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default function CandleChart({ symbol }) {
  const { data: candles, loading } = usePolling(() => getCandles(symbol, 60), 3000, [symbol])
  const containerRef = useRef(null)
  const [width, height] = useSize(containerRef)

  const chartData = (candles || []).map((candle, index) => ({
    ...candle,
    i: index,
    bullish: candle.close >= candle.open,
    body: [Math.min(candle.open, candle.close), Math.max(candle.open, candle.close)],
    wick: [candle.low, candle.high],
  }))

  const last = chartData[chartData.length - 1]
  const prev = chartData[chartData.length - 2]
  const direction = last && prev
    ? last.close > prev.close
      ? 'up'
      : last.close < prev.close
        ? 'down'
        : 'flat'
    : 'flat'

  const directionColor = direction === 'up'
    ? 'var(--green)'
    : direction === 'down'
      ? 'var(--red)'
      : 'var(--amber)'

  const changePct = last && prev && prev.close
    ? ((last.close - prev.close) / prev.close) * 100
    : 0

  const prices = chartData.flatMap((candle) => [candle.high, candle.low]).filter((value) => value != null)
  const minPrice = prices.length ? Math.min(...prices) * 0.9995 : 0
  const maxPrice = prices.length ? Math.max(...prices) * 1.0005 : 0
  const rangeLabel = prices.length
    ? `${formatPrice(Math.min(...prices))} - ${formatPrice(Math.max(...prices))}`
    : '--'

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="panel-title">{symbol} / USD</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--text-secondary)',
              background: 'var(--bg-panel-3)',
              padding: '2px 7px',
              borderRadius: 999,
              border: '1px solid var(--border)',
            }}
          >
            10S CANDLES
          </span>
        </div>

        {last && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {formatPrice(last.close)}
            </span>
            <span className={`badge ${direction}`}>
              {changePct >= 0 ? '+' : ''}
              {changePct.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          padding: '12px 14px 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <StatCard label="Last Price" value={formatPrice(last?.close)} accent={directionColor} />
        <StatCard label="Session High" value={formatPrice(last?.high)} accent="var(--text-primary)" />
        <StatCard label="Session Low" value={formatPrice(last?.low)} accent="var(--text-primary)" />
        <StatCard label="VWAP" value={formatPrice(last?.vwap)} accent="var(--amber)" />
        <StatCard label="Volume" value={formatNumber(last?.volume)} accent="var(--cyan)" />
      </div>

      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
          padding: '12px 6px 8px 0',
        }}
      >
        {loading || !chartData.length ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div className="skeleton" style={{ width: '68%', height: 78, borderRadius: 6 }} />
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-muted)',
                letterSpacing: '0.14em',
              }}
            >
              AWAITING MARKET CANDLES
            </div>
          </div>
        ) : width > 0 && height > 0 ? (
          <ComposedChart
            width={width}
            height={height - 8}
            data={chartData}
            margin={{ left: 10, right: 72, top: 6, bottom: 12 }}
          >
            <XAxis dataKey="i" hide />
            <YAxis
              domain={[minPrice, maxPrice]}
              orientation="right"
              width={68}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--border-bright)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Bar dataKey="wick" shape={<WickShape />} isAnimationActive={false} />
            <Bar dataKey="body" shape={<BodyShape />} isAnimationActive={false} />
            <Line
              dataKey="vwap"
              dot={false}
              strokeWidth={1.4}
              stroke="var(--amber)"
              strokeDasharray="6 4"
              isAnimationActive={false}
              opacity={0.78}
            />
            {last && (
              <ReferenceLine
                y={last.close}
                stroke={directionColor}
                strokeDasharray="3 6"
                strokeWidth={1}
                opacity={0.7}
              />
            )}
          </ComposedChart>
        ) : null}
      </div>

      <div
        style={{
          padding: '8px 14px 12px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 14,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
          }}
        >
          RANGE {rangeLabel}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
          }}
        >
          {chartData.length} LIVE CANDLES
        </span>
        {last?.vwap != null && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--amber)',
              marginLeft: 'auto',
            }}
          >
            VWAP {formatPrice(last.vwap)}
          </span>
        )}
      </div>
    </div>
  )
}
