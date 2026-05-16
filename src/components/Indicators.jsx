import { usePolling } from '../hooks/usePolling'
import { getPrice } from '../api/client'

function MiniBar({ value, min = 0, max = 100, color }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  return (
    <div style={{ flex: 1, height: 3, background: 'var(--bg-panel-3)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        width: pct + '%', height: '100%', background: color,
        borderRadius: 2, transition: 'width 0.5s ease',
        boxShadow: `0 0 4px ${color}`,
      }} />
    </div>
  )
}

function Cell({ label, value, color = 'var(--text-primary)', bar, barMin, barMax, barColor, format }) {
  const fmt = v => {
    if (v == null) return '—'
    if (format) return format(v)
    return Number(v).toFixed(3)
  }
  const hasValue = value != null

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '6px 10px',
      borderRight: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 8,
          color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: hasValue ? 600 : 400,
          color: hasValue ? color : 'var(--text-ghost)',
        }}>
          {fmt(value)}
        </span>
      </div>
      {bar && hasValue && (
        <MiniBar value={value} min={barMin} max={barMax} color={barColor} />
      )}
      {bar && !hasValue && (
        <div style={{ height: 3, background: 'var(--bg-panel-3)', borderRadius: 2 }} />
      )}
    </div>
  )
}

export default function Indicators({ symbol }) {
  const { data: d, loading } = usePolling(() => getPrice(symbol), 2000, [symbol])

  const rsiColor = !d?.rsi ? 'var(--text-primary)'
    : d.rsi > 70 ? 'var(--red)'
    : d.rsi < 30 ? 'var(--green)'
    : 'var(--amber)'

  const macdColor = d?.macd == null ? 'var(--text-primary)'
    : d.macd > (d.macd_signal ?? 0) ? 'var(--green)' : 'var(--red)'

  const ofiColor = d?.ofi == null ? 'var(--text-primary)'
    : d.ofi > 0.2 ? 'var(--green)'
    : d.ofi < -0.2 ? 'var(--red)'
    : 'var(--amber)'

  const vwapColor = d?.vwap == null ? 'var(--text-primary)'
    : (d.price ?? 0) >= d.vwap ? 'var(--green)' : 'var(--red)'

  const emaColor = d?.ema_short == null ? 'var(--text-primary)'
    : d.ema_short >= (d.ema_long ?? 0) ? 'var(--green)' : 'var(--red)'

  // How many non-null values do we have?
  const fields = [d?.rsi, d?.macd, d?.vwap, d?.ema_short, d?.ofi]
  const anyData = d && fields.some(v => v != null)

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Indicators — {symbol}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {d && !anyData && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>
              awaiting trades…
            </span>
          )}
          {d?.volume != null && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
              vol {d.volume.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ padding: '6px 10px', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ height: 10, width: '55%', marginBottom: 5 }} />
              <div className="skeleton" style={{ height: 14, width: '40%' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <Cell label="RSI 14"   value={d?.rsi}         color={rsiColor}  bar barMin={0}  barMax={100} barColor={rsiColor} />
          <Cell label="MACD"     value={d?.macd}         color={macdColor} />
          <Cell label="MACD Sig" value={d?.macd_signal}  color="var(--text-secondary)" />
          <Cell label="BB Upper" value={d?.bb_upper}     color="var(--text-secondary)" />
          <Cell label="BB Lower" value={d?.bb_lower}     color="var(--text-secondary)" />
          <Cell label="VWAP"     value={d?.vwap}         color={vwapColor} />
          <Cell label="EMA 9"    value={d?.ema_short}    color={emaColor} />
          <Cell label="EMA 21"   value={d?.ema_long}     color={emaColor} />
          <Cell label="OFI"      value={d?.ofi}          color={ofiColor}  bar barMin={-1} barMax={1}   barColor={ofiColor} />
          <Cell label="Spread"   value={d?.spread}       color="var(--cyan)" />
        </div>
      )}
    </div>
  )
}