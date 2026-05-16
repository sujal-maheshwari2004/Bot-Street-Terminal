import { getPrice } from '../api/client'
import { usePolling } from '../hooks/usePolling'

function MiniBar({ value, min = 0, max = 100, color }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))

  return (
    <div style={{ flex: 1, height: 5, background: 'var(--bg-panel-3)', borderRadius: 999, overflow: 'hidden' }}>
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 999,
          transition: 'width 0.5s ease',
          boxShadow: `0 0 6px ${color}`,
        }}
      />
    </div>
  )
}

function Cell({
  label,
  value,
  color = 'var(--text-primary)',
  bar,
  barMin,
  barMax,
  barColor,
  format,
}) {
  const hasValue = value != null
  const displayValue = (() => {
    if (!hasValue) return '--'
    if (format) return format(value)
    return Number(value).toFixed(3)
  })()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(36, 51, 72, 0.85)',
        background: 'rgba(8, 12, 18, 0.72)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 15,
            fontWeight: 700,
            color: hasValue ? color : 'var(--text-ghost)',
          }}
        >
          {displayValue}
        </span>
      </div>

      {bar ? (
        hasValue
          ? <MiniBar value={value} min={barMin} max={barMax} color={barColor} />
          : <div style={{ height: 5, borderRadius: 999, background: 'var(--bg-panel-3)' }} />
      ) : null}
    </div>
  )
}

export default function Indicators({ symbol }) {
  const { data, loading } = usePolling(() => getPrice(symbol), 2000, [symbol])

  const rsiColor = data?.rsi == null
    ? 'var(--text-primary)'
    : data.rsi > 70
      ? 'var(--red)'
      : data.rsi < 30
        ? 'var(--green)'
        : 'var(--amber)'

  const macdColor = data?.macd == null
    ? 'var(--text-primary)'
    : data.macd > (data.macd_signal ?? 0)
      ? 'var(--green)'
      : 'var(--red)'

  const ofiColor = data?.ofi == null
    ? 'var(--text-primary)'
    : data.ofi > 0.2
      ? 'var(--green)'
      : data.ofi < -0.2
        ? 'var(--red)'
        : 'var(--amber)'

  const vwapColor = data?.vwap == null
    ? 'var(--text-primary)'
    : (data.price ?? 0) >= data.vwap
      ? 'var(--green)'
      : 'var(--red)'

  const emaColor = data?.ema_short == null
    ? 'var(--text-primary)'
    : data.ema_short >= (data.ema_long ?? 0)
      ? 'var(--green)'
      : 'var(--red)'

  const indicatorValues = [data?.rsi, data?.macd, data?.vwap, data?.ema_short, data?.ofi]
  const anyData = data && indicatorValues.some((value) => value != null)

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="panel-header">
        <span className="panel-title">Indicators - {symbol}</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {data && !anyData && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              awaiting live trade data
            </span>
          )}
          {data?.volume != null && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>
              vol {data.volume.toLocaleString('en-US')}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 10,
            padding: 12,
          }}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ height: 10, width: '56%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 18, width: '42%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 5, width: '100%' }} />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 10,
            padding: 12,
          }}
        >
          <Cell label="RSI 14" value={data?.rsi} color={rsiColor} bar barMin={0} barMax={100} barColor={rsiColor} />
          <Cell label="MACD" value={data?.macd} color={macdColor} />
          <Cell label="MACD Signal" value={data?.macd_signal} color="var(--text-secondary)" />
          <Cell label="VWAP" value={data?.vwap} color={vwapColor} />
          <Cell label="EMA 9" value={data?.ema_short} color={emaColor} />
          <Cell label="EMA 21" value={data?.ema_long} color={emaColor} />
          <Cell label="BB Upper" value={data?.bb_upper} color="var(--text-secondary)" />
          <Cell label="BB Lower" value={data?.bb_lower} color="var(--text-secondary)" />
          <Cell label="OFI" value={data?.ofi} color={ofiColor} bar barMin={-1} barMax={1} barColor={ofiColor} />
          <Cell label="Spread" value={data?.spread} color="var(--cyan)" format={(value) => value.toFixed(4)} />
        </div>
      )}
    </div>
  )
}
