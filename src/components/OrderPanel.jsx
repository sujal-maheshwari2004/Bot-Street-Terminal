import { useState } from 'react'
import { placeOrder } from '../api/client'

const SIDES = ['buy', 'sell']
const TYPES = ['limit', 'market']

export default function OrderPanel({ symbol }) {
  const [side,     setSide]     = useState('buy')
  const [type,     setType]     = useState('limit')
  const [qty,      setQty]      = useState('')
  const [price,    setPrice]    = useState('')
  const [clientId, setClientId] = useState('user')
  const [status,   setStatus]   = useState(null)
  const [loading,  setLoading]  = useState(false)

  const isBuy = side === 'buy'
  const accentColor = isBuy ? 'var(--green)' : 'var(--red)'

  const submit = async () => {
    if (!qty || qty <= 0) return setStatus({ ok: false, msg: 'QTY REQUIRED' })
    if (type === 'limit' && !price) return setStatus({ ok: false, msg: 'PRICE REQUIRED' })

    setLoading(true)
    setStatus(null)
    try {
      const order = {
        symbol,
        side,
        order_type: type,
        quantity: parseInt(qty),
        client_id: clientId || 'user',
        ...(type === 'limit' && { price: parseFloat(price) }),
      }
      const res = await placeOrder(order)
      setStatus({ ok: true, msg: `ACCEPTED · ${res.order_id?.slice(0, 8)}` })
      setQty('')
      setPrice('')
    } catch (e) {
      const msg = e.response?.data?.detail ?? e.message ?? 'ORDER REJECTED'
      setStatus({ ok: false, msg: msg.toUpperCase().slice(0, 40) })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg-panel-3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    padding: '4px 8px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s',
    height: 28,
  }

  const label = text => (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 8,
      color: 'var(--text-muted)', letterSpacing: '0.1em',
      textTransform: 'uppercase', marginBottom: 3,
    }}>{text}</div>
  )

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span className="panel-title">Order Entry</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: accentColor }}>
          {symbol}
        </span>
      </div>

      <div style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>

        {/* Side selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {SIDES.map(s => {
            const active = side === s
            const c     = s === 'buy' ? 'var(--green)' : 'var(--red)'
            const faint = s === 'buy' ? 'var(--green-faint)' : 'var(--red-faint)'
            return (
              <button key={s} onClick={() => setSide(s)} style={{
                background:    active ? faint : 'transparent',
                color:         active ? c : 'var(--text-muted)',
                border:        `1px solid ${active ? c : 'var(--border)'}`,
                borderRadius:  'var(--radius-sm)',
                fontFamily:    'var(--font-mono)',
                fontSize:      9,
                fontWeight:    700,
                letterSpacing: '0.15em',
                padding:       '4px 0',
                cursor:        'pointer',
                transition:    'all 0.15s',
                boxShadow:     active ? `0 0 8px ${faint}` : 'none',
              }}>
                {s.toUpperCase()}
              </button>
            )
          })}
        </div>

        {/* Type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {TYPES.map(t => {
            const active = type === t
            return (
              <button key={t} onClick={() => setType(t)} style={{
                background:    active ? 'var(--amber-faint)' : 'transparent',
                color:         active ? 'var(--amber)' : 'var(--text-muted)',
                border:        `1px solid ${active ? 'var(--amber)' : 'var(--border)'}`,
                borderRadius:  'var(--radius-sm)',
                fontFamily:    'var(--font-mono)',
                fontSize:      9,
                letterSpacing: '0.12em',
                padding:       '3px 0',
                cursor:        'pointer',
                transition:    'all 0.15s',
              }}>
                {t.toUpperCase()}
              </button>
            )
          })}
        </div>

        {/* Qty + Price side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: type === 'limit' ? '1fr 1fr' : '1fr', gap: 6 }}>
          <div>
            {label('Qty')}
            <input
              type="number" min="1" value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="0"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = accentColor}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          {type === 'limit' && (
            <div>
              {label('Price USD')}
              <input
                type="number" step="0.01" value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = accentColor}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          )}
        </div>

        {/* Client ID */}
        <div>
          {label('Client ID')}
          <input
            type="text" value={clientId}
            onChange={e => setClientId(e.target.value)}
            placeholder="user"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = accentColor}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Submit */}
        <button onClick={submit} disabled={loading} style={{
          background:    isBuy ? 'rgba(0,230,118,0.15)' : 'rgba(255,61,61,0.15)',
          color:         accentColor,
          border:        `1px solid ${accentColor}`,
          borderRadius:  'var(--radius-sm)',
          fontFamily:    'var(--font-mono)',
          fontSize:      10,
          fontWeight:    700,
          letterSpacing: '0.15em',
          padding:       '7px',
          cursor:        loading ? 'not-allowed' : 'pointer',
          opacity:       loading ? 0.6 : 1,
          transition:    'all 0.15s',
          boxShadow:     `0 0 10px ${isBuy ? 'var(--green-glow)' : 'var(--red-faint)'}`,
        }}>
          {loading ? 'SENDING...' : `${side.toUpperCase()} ${symbol}`}
        </button>

        {/* Status */}
        {status && (
          <div style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      9,
            color:         status.ok ? 'var(--green)' : 'var(--red)',
            textAlign:     'center',
            letterSpacing: '0.06em',
            padding:       '3px 8px',
            background:    status.ok ? 'var(--green-faint)' : 'var(--red-faint)',
            borderRadius:  'var(--radius-sm)',
            border:        `1px solid ${status.ok ? 'var(--green)' : 'var(--red)'}`,
          }}>
            {status.ok ? '✓' : '✗'} {status.msg}
          </div>
        )}
      </div>
    </div>
  )
}