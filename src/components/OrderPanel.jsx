import { useState } from 'react'
import { placeOrder } from '../api/client'

const SIDES = ['buy', 'sell']
const TYPES = ['limit', 'market']

export default function OrderPanel({ symbol }) {
  const [side, setSide] = useState('buy')
  const [type, setType] = useState('limit')
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [clientId, setClientId] = useState('user')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const isBuy = side === 'buy'
  const accentColor = isBuy ? 'var(--green)' : 'var(--red)'

  const inputStyle = {
    background: 'rgba(8, 12, 18, 0.78)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    padding: '10px 12px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    height: 44,
  }

  const label = (text) => (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 6,
      }}
    >
      {text}
    </div>
  )

  const submit = async () => {
    if (!qty || qty <= 0) {
      setStatus({ ok: false, msg: 'Quantity is required' })
      return
    }

    if (type === 'limit' && !price) {
      setStatus({ ok: false, msg: 'Limit price is required' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const order = {
        symbol,
        side,
        order_type: type,
        quantity: parseInt(qty, 10),
        client_id: clientId || 'user',
        ...(type === 'limit' && { price: parseFloat(price) }),
      }

      const response = await placeOrder(order)
      setStatus({ ok: true, msg: `Order accepted: ${response.order_id?.slice(0, 8)}` })
      setQty('')
      setPrice('')
    } catch (error) {
      const message = error.response?.data?.detail ?? error.message ?? 'Order rejected'
      setStatus({ ok: false, msg: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="panel-header">
        <span className="panel-title">Order Entry</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: accentColor }}>
          {symbol}
        </span>
      </div>

      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SIDES.map((item) => {
            const active = side === item
            const itemColor = item === 'buy' ? 'var(--green)' : 'var(--red)'
            const itemBg = item === 'buy' ? 'var(--green-faint)' : 'var(--red-faint)'

            return (
              <button
                key={item}
                onClick={() => setSide(item)}
                style={{
                  background: active ? itemBg : 'transparent',
                  color: active ? itemColor : 'var(--text-muted)',
                  border: `1px solid ${active ? itemColor : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  padding: '10px 0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.toUpperCase()}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {TYPES.map((item) => {
            const active = type === item

            return (
              <button
                key={item}
                onClick={() => setType(item)}
                style={{
                  background: active ? 'var(--amber-faint)' : 'transparent',
                  color: active ? 'var(--amber)' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'var(--amber)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  padding: '10px 0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.toUpperCase()}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: type === 'limit' ? '1fr 1fr' : '1fr', gap: 10 }}>
          <div>
            {label('Quantity')}
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(event) => setQty(event.target.value)}
              placeholder="0"
              style={inputStyle}
              onFocus={(event) => {
                event.target.style.borderColor = accentColor
                event.target.style.boxShadow = `0 0 0 1px ${accentColor}`
              }}
              onBlur={(event) => {
                event.target.style.borderColor = 'var(--border)'
                event.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {type === 'limit' && (
            <div>
              {label('Price (USD)')}
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0.00"
                style={inputStyle}
                onFocus={(event) => {
                  event.target.style.borderColor = accentColor
                  event.target.style.boxShadow = `0 0 0 1px ${accentColor}`
                }}
                onBlur={(event) => {
                  event.target.style.borderColor = 'var(--border)'
                  event.target.style.boxShadow = 'none'
                }}
              />
            </div>
          )}
        </div>

        <div>
          {label('Client ID')}
          <input
            type="text"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            placeholder="user"
            style={inputStyle}
            onFocus={(event) => {
              event.target.style.borderColor = accentColor
              event.target.style.boxShadow = `0 0 0 1px ${accentColor}`
            }}
            onBlur={(event) => {
              event.target.style.borderColor = 'var(--border)'
              event.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          style={{
            marginTop: 'auto',
            background: isBuy ? 'rgba(0, 230, 118, 0.14)' : 'rgba(255, 61, 61, 0.14)',
            color: accentColor,
            border: `1px solid ${accentColor}`,
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            padding: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.15s ease',
            boxShadow: `0 0 14px ${isBuy ? 'var(--green-glow)' : 'var(--red-faint)'}`,
          }}
        >
          {loading ? 'SENDING ORDER' : `${side.toUpperCase()} ${symbol}`}
        </button>

        {status && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: status.ok ? 'var(--green)' : 'var(--red)',
              textAlign: 'center',
              padding: '10px 12px',
              background: status.ok ? 'var(--green-faint)' : 'var(--red-faint)',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${status.ok ? 'var(--green)' : 'var(--red)'}`,
            }}
          >
            {status.msg}
          </div>
        )}
      </div>
    </div>
  )
}
