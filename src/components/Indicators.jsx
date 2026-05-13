import { usePolling } from '../hooks/usePolling'
import { getPrice } from '../api/client'

const Bar = ({ value, min = 0, max = 100, color }) => {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  return (
    <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 2, transition: 'width 0.4s' }} />
    </div>
  )
}

const Row = ({ label, value, unit = '', color = 'var(--white)', bar, barMin, barMax, barColor }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 10px' }}>
    <span style={{ color: 'var(--muted)', fontSize: 9, width: 64, flexShrink: 0, letterSpacing: '0.08em' }}>{label}</span>
    {bar && <Bar value={value ?? 0} min={barMin} max={barMax} color={barColor} />}
    <span style={{ color, fontSize: 10, fontWeight: 500, width: 70, textAlign: 'right', flexShrink: 0 }}>
      {value != null ? `${Number(value).toFixed(3)}${unit}` : '—'}
    </span>
  </div>
)

export default function Indicators({ symbol }) {
  const { data: d, loading } = usePolling(() => getPrice(symbol), 2000, [symbol])

  const rsiColor = !d?.rsi ? 'var(--white)'
    : d.rsi > 70 ? 'var(--red)'
    : d.rsi < 30 ? 'var(--green)'
    : 'var(--amber)'

  const macdColor = d?.macd == null ? 'var(--white)'
    : d.macd > (d.macd_signal ?? 0) ? 'var(--green)' : 'var(--red)'

  const ofiColor = d?.ofi == null ? 'var(--white)'
    : d.ofi > 0.2 ? 'var(--green)'
    : d.ofi < -0.2 ? 'var(--red)'
    : 'var(--amber)'

  const vwapColor = d?.vwap == null ? 'var(--white)'
    : d.price >= d.vwap ? 'var(--green)' : 'var(--red)'

  const emaColor = d?.ema_short == null ? 'var(--white)'
    : d.ema_short >= d.ema_long ? 'var(--green)' : 'var(--red)'

  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <span>Indicators — {symbol}</span>
        {d && <span style={{ color: 'var(--muted)' }}>vol {d.volume?.toLocaleString()}</span>}
      </div>

      {loading || !d ? (
        <div style={{ padding: 8, color: 'var(--muted)', fontSize: 10 }}>LOADING...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', paddingTop: 4 }}>
          <Row label="RSI (14)"    value={d.rsi}        color={rsiColor}  bar barMin={0}   barMax={100} barColor={rsiColor} />
          <Row label="MACD"        value={d.macd}       color={macdColor} />
          <Row label="MACD SIG"    value={d.macd_signal} color="var(--muted)" />
          <Row label="BB UPPER"    value={d.bb_upper}   color="var(--muted)" />
          <Row label="BB LOWER"    value={d.bb_lower}   color="var(--muted)" />
          <Row label="VWAP"        value={d.vwap}       color={vwapColor} />
          <Row label="EMA 9"       value={d.ema_short}  color={emaColor} />
          <Row label="EMA 21"      value={d.ema_long}   color={emaColor} />
          <Row label="OFI"         value={d.ofi}        color={ofiColor}  bar barMin={-1} barMax={1}   barColor={ofiColor} />
          <Row label="SPREAD"      value={d.spread}     color="var(--cyan)" unit="" />
        </div>
      )}
    </div>
  )
}