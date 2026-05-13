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
  const [status,   setStatus]   = useState(null) // {ok, msg}
  const [loading,  setLoading]  = useState(false)

  const submit = async () => {
    if (!qty || qty <= 0) return setStatus({ ok: false, msg: 'QTY REQUIRED' })
    if (type === 'limit' && !price) return setStatus({ ok: false, msg: 'PRICE REQUIRED FOR LIMIT' })

    setLoading(true)
    setStatus(null)
    try {
      const order = {
        symbol,
        side,
        order_type: type,
        quantity:   parseInt(qty),
        client_id:  clientId || 'user',
        ...(type === 'limit' && { price: parseFloat(price) }),
      }
      const res = await placeOrder(order)
      setStatus({ ok: true, msg: `ACCEPTED · ${res.order_id?.slice(0, 8)}` })
      setQty(''); setPrice('')
    } catch (e) {
      const msg = e.response?.data?.detail ?? e.message ?? 'ORDER REJECTED'
      setStatus({ ok: false, msg: msg.toUpperCase() })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background:   'var(--bg-base)',
    border:       '1px solid var(--border)',
    color:        'var(--white)',
    fontFamily:   'var(--font-mono)',
    fontSize:     10,
    padding:      '4px 8px',
    width:        '100%',
    outline:      'none',
  }

  const btnStyle = (active, color) => ({
    flex:         1,
    background:   active ? color : 'transparent',
    color:        active ? '#000' : 'var(--muted)',
    border:       `1px solid ${active ? color : 'var(--border)'}`,
    fontFamily:   'var(--font-mono)',
    fontSize:     9,
    letterSpacing:'0.1em',
    padding:      '3px 0',
    cursor:       'pointer',
    transition:   'all 0.15s',
  })

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span>Order Entry — {symbol}</span>
      </div>

      <div style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* Side */}
        <div style={{ display: 'flex', gap: 4 }}>
          {SIDES.map(s => (
            <button key={s} onClick={() => setSide(s)}
              style={btnStyle(side === s, s === 'buy' ? 'var(--green)' : 'var(--red)')}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Type */}
        <div style={{ display: 'flex', gap: 4 }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              style={btnStyle(type === t, 'var(--amber)')}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Qty */}
        <div>
          <div className="label" style={{ marginBottom: 3 }}>quantity</div>
          <input
            type="number" min="1" value={qty}
            onChange={e => setQty(e.target.value)}
            placeholder="0"
            style={inputStyle}
          />
        </div>

        {/* Price */}
        {type === 'limit' && (
          <div>
            <div className="label" style={{ marginBottom: 3 }}>price (USD)</div>
            <input
              type="number" step="0.01" value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              style={inputStyle}
            />
          </div>
        )}

        {/* Client ID */}
        <div>
          <div className="label" style={{ marginBottom: 3 }}>client id</div>
          <input
            type="text" value={clientId}
            onChange={e => setClientId(e.target.value)}
            placeholder="user"
            style={inputStyle}
          />
        </div>

        {/* Submit */}
        <button onClick={submit} disabled={loading} style={{
          background:    side === 'buy' ? 'var(--green)' : 'var(--red)',
          color:         '#000',
          border:        'none',
          fontFamily:    'var(--font-mono)',
          fontSize:      10,
          fontWeight:    600,
          letterSpacing: '0.12em',
          padding:       '6px',
          cursor:        loading ? 'not-allowed' : 'pointer',
          opacity:       loading ? 0.6 : 1,
          marginTop:     2,
        }}>
          {loading ? 'SENDING...' : `${side.toUpperCase()} ${symbol}`}
        </button>

        {/* Status */}
        {status && (
          <div style={{
            fontSize:  9,
            color:     status.ok ? 'var(--green)' : 'var(--red)',
            textAlign: 'center',
            letterSpacing: '0.08em',
          }}>
            {status.ok ? '✓' : '✗'} {status.msg}
          </div>
        )}
      </div>
    </div>
  )
}