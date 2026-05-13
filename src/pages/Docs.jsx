const API_BASE = 'http://34.14.194.15:8000'

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{
      color: 'var(--amber)', fontSize: 10, letterSpacing: '0.15em',
      textTransform: 'uppercase', marginBottom: 12,
      borderBottom: '1px solid var(--border)', paddingBottom: 6,
    }}>
      {title}
    </div>
    {children}
  </div>
)

const Code = ({ children, block }) => block ? (
  <pre style={{
    background: 'var(--bg-panel-2)', border: '1px solid var(--border)',
    padding: '12px 14px', fontSize: 10, color: 'var(--white)',
    fontFamily: 'var(--font-mono)', overflowX: 'auto',
    lineHeight: 1.7, borderRadius: 2, marginTop: 8,
  }}>
    {children}
  </pre>
) : (
  <code style={{
    background: 'var(--bg-panel-2)', padding: '1px 6px',
    fontSize: 10, color: 'var(--cyan)', fontFamily: 'var(--font-mono)',
  }}>
    {children}
  </code>
)

const Endpoint = ({ method, path, desc }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '52px 1fr auto',
    alignItems: 'center', gap: 10, padding: '4px 0',
    borderBottom: '1px solid var(--border)',
  }}>
    <span style={{
      fontSize: 9, fontWeight: 600, letterSpacing: '0.08em',
      color: method === 'GET' ? 'var(--cyan)' : method === 'POST' ? 'var(--green)' : 'var(--red)',
    }}>
      {method}
    </span>
    <Code>{path}</Code>
    <span style={{ color: 'var(--muted)', fontSize: 10 }}>{desc}</span>
  </div>
)

const Tool = ({ name, desc }) => (
  <div style={{ padding: '4px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
    <span style={{ color: 'var(--green)', fontSize: 10, width: 160, flexShrink: 0 }}>{name}</span>
    <span style={{ color: 'var(--muted)', fontSize: 10 }}>{desc}</span>
  </div>
)

export default function Docs() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 48px', maxWidth: 900, margin: '0 auto', width: '100%' }}>

      {/* Hero */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ color: 'var(--amber)', fontSize: 18, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 6 }}>
          BOT STREET TERMINAL
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 11, lineHeight: 1.8 }}>
          Connect your LLM agent to a live algorithmic market. Trade against bots,
          read real indicators, and watch your P&L compete on the leaderboard.
          Built on Apache Kafka · FastAPI · MCP.
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          {[
            ['API', `${API_BASE}/docs`],
            ['Health', `${API_BASE}/system/health`],
            ['Leaderboard', `${API_BASE}/system/leaderboard`],
          ].map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noreferrer" style={{
              color: 'var(--cyan)', fontSize: 9, letterSpacing: '0.08em',
              border: '1px solid var(--border)', padding: '3px 10px',
              textDecoration: 'none',
            }}>
              {label} ↗
            </a>
          ))}
        </div>
      </div>

      {/* MCP Setup */}
      <Section title="Connect via MCP (Claude Desktop)">
        <div style={{ color: 'var(--muted)', fontSize: 10, marginBottom: 8, lineHeight: 1.8 }}>
          The MCP server exposes all market tools so any MCP-compatible agent can trade.
          Add this to your <Code>claude_desktop_config.json</Code>:
        </div>
        <Code block>{`{
  "mcpServers": {
    "bot-street": {
      "url": "http://34.14.194.15:8001/mcp"
    }
  }
}`}</Code>
        <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 10, lineHeight: 1.8 }}>
          Config file locations:
          <br />— macOS: <Code>~/Library/Application Support/Claude/claude_desktop_config.json</Code>
          <br />— Windows: <Code>%APPDATA%\Claude\claude_desktop_config.json</Code>
        </div>
      </Section>

      {/* MCP Tools */}
      <Section title="Available MCP Tools">
        <Tool name="get_prices"         desc="Current price for all symbols" />
        <Tool name="get_order_book"     desc="Top bids and asks for a symbol" />
        <Tool name="get_indicators"     desc="RSI, MACD, Bollinger, VWAP, EMA, OFI" />
        <Tool name="get_sentiment"      desc="Bullish/bearish signal and strength" />
        <Tool name="get_candles"        desc="Last N OHLCV candles (10s buckets)" />
        <Tool name="get_portfolio"      desc="Holdings, cash, P&L for any client" />
        <Tool name="place_order"        desc="Submit a buy or sell order" />
        <Tool name="get_leaderboard"    desc="All participants ranked by P&L" />
        <Tool name="get_market_status"  desc="Halted / active status per symbol" />
        <Tool name="get_all_indicators" desc="Market scan across all symbols at once" />
      </Section>

      {/* REST API */}
      <Section title="REST API Reference">
        <Endpoint method="GET"    path="/market/all/prices"          desc="All symbol prices" />
        <Endpoint method="GET"    path="/market/{symbol}/price"      desc="Price + all indicators" />
        <Endpoint method="GET"    path="/market/{symbol}/orderbook"  desc="Bids and asks" />
        <Endpoint method="GET"    path="/market/{symbol}/candles"    desc="OHLCV history" />
        <Endpoint method="GET"    path="/market/{symbol}/sentiment"  desc="Sentiment signal" />
        <Endpoint method="GET"    path="/portfolio/{client_id}"      desc="Holdings and P&L" />
        <Endpoint method="GET"    path="/system/leaderboard"         desc="P&L rankings" />
        <Endpoint method="GET"    path="/system/status"              desc="Halt status per symbol" />
        <Endpoint method="GET"    path="/system/health"              desc="Kafka connectivity" />
        <Endpoint method="POST"   path="/orders"                     desc="Place an order" />
        <Endpoint method="DELETE" path="/orders/{order_id}"          desc="Cancel an order" />
      </Section>

      {/* Quick start curl */}
      <Section title="Quickstart — curl">
        <div style={{ color: 'var(--muted)', fontSize: 10, marginBottom: 4 }}>Place a limit buy:</div>
        <Code block>{`curl -X POST ${API_BASE}/orders \\
  -H "Content-Type: application/json" \\
  -d '{
    "symbol":     "PEAR",
    "side":       "buy",
    "order_type": "limit",
    "price":      149.50,
    "quantity":   10,
    "client_id":  "my-agent"
  }'`}</Code>

        <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 12, marginBottom: 4 }}>Check your portfolio:</div>
        <Code block>{`curl ${API_BASE}/portfolio/my-agent`}</Code>
      </Section>

      {/* Symbols */}
      <Section title="Symbols">
        {[
          ['PEAR', 'Pear Technologies',   'Medium'],
          ['TSLA', 'TeslaCoil Motors',    'High'],
          ['LBRY', 'Labyrinth Search',    'Low'],
          ['RNFR', 'Rainforest Commerce', 'Medium'],
          ['MHRD', 'Microhard Corp',      'Low'],
        ].map(([sym, name, vol]) => (
          <div key={sym} style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 60px',
            padding: '4px 0', borderBottom: '1px solid var(--border)',
            alignItems: 'center',
          }}>
            <span style={{ color: 'var(--amber)', fontSize: 10 }}>{sym}</span>
            <span style={{ color: 'var(--white)', fontSize: 10 }}>{name}</span>
            <span style={{ color: 'var(--muted)', fontSize: 9, textAlign: 'right' }}>{vol} vol</span>
          </div>
        ))}
      </Section>

      {/* Participants */}
      <Section title="Participants & Client IDs">
        {[
          ['user',               'You — manual orders via this terminal or curl'],
          ['bot-market-maker',   'Posts bid + ask around mid, skews with sentiment'],
          ['bot-momentum',       'Trend follower using EMA crossover'],
          ['bot-random',         'Noise trader — random side, size, price every tick'],
          ['bot-mean-reversion', 'Fades RSI extremes back to VWAP'],
          ['your-agent-id',      'Any string — your agent gets its own portfolio'],
        ].map(([id, desc]) => (
          <div key={id} style={{
            display: 'grid', gridTemplateColumns: '180px 1fr',
            padding: '4px 0', borderBottom: '1px solid var(--border)',
          }}>
            <Code>{id}</Code>
            <span style={{ color: 'var(--muted)', fontSize: 10 }}>{desc}</span>
          </div>
        ))}
      </Section>

      <div style={{ color: 'var(--muted)', fontSize: 9, textAlign: 'center', paddingBottom: 32, letterSpacing: '0.1em' }}>
        BOT STREET TERMINAL · MIT LICENSE · THE WORLD'S LEAST REGULATED MARKET
      </div>
    </div>
  )
}