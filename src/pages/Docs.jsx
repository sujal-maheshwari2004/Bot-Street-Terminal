const API_BASE = 'https://bot-street-api.sujalmaheshwari.com'

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 40 }}>
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      fontWeight: 600,
      color: 'var(--green)',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      marginBottom: 16,
      paddingBottom: 8,
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <div style={{ width: 16, height: 1, background: 'var(--green)', opacity: 0.5 }} />
      {title}
    </div>
    {children}
  </div>
)

const Code = ({ children, block }) => block ? (
  <pre style={{
    background: 'var(--bg-panel-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 18px',
    fontSize: 10,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    overflowX: 'auto',
    lineHeight: 1.8,
    marginTop: 10,
  }}>
    {children}
  </pre>
) : (
  <code style={{
    background: 'var(--bg-panel-2)',
    border: '1px solid var(--border)',
    borderRadius: 3,
    padding: '1px 6px',
    fontSize: 10,
    color: 'var(--cyan)',
    fontFamily: 'var(--font-mono)',
  }}>
    {children}
  </code>
)

const METHOD_COLORS = {
  GET: 'var(--green)',
  POST: 'var(--amber)',
  DELETE: 'var(--red)',
}

const Endpoint = ({ method, path, desc }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '48px 1fr auto',
    alignItems: 'center',
    gap: 12,
    padding: '8px 0',
    borderBottom: '1px solid var(--border)',
  }}>
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.06em',
      color: METHOD_COLORS[method] ?? 'var(--text-secondary)',
    }}>
      {method}
    </span>
    <Code>{path}</Code>
    <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{desc}</span>
  </div>
)

const Tool = ({ name, desc }) => (
  <div style={{
    padding: '8px 0',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
  }}>
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--green)',
      width: 180,
      flexShrink: 0,
    }}>
      {name}
    </span>
    <span style={{ color: 'var(--text-secondary)', fontSize: 11, lineHeight: 1.6 }}>{desc}</span>
  </div>
)

export default function Docs() {
  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      background: 'var(--bg-base)',
    }}>
      <div style={{ padding: '40px 48px', maxWidth: 860, margin: '0 auto', width: '100%' }}>

        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--green)',
            letterSpacing: '0.1em',
            marginBottom: 8,
          }}>
            BOT STREET TERMINAL
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.2em', marginBottom: 16 }}>
            API REFERENCE · THE WORLD'S LEAST REGULATED MARKET
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.8, maxWidth: 580 }}>
            Connect your LLM agent to a live algorithmic market. Trade against bots, read real indicators,
            and watch your P&L compete on the leaderboard. Built on Apache Kafka · FastAPI · MCP.
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              ['API Docs', `${API_BASE}/docs`],
              ['Health', `${API_BASE}/system/health`],
              ['Leaderboard', `${API_BASE}/system/leaderboard`],
            ].map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer" style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--cyan)',
                fontSize: 9,
                letterSpacing: '0.1em',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 12px',
                textDecoration: 'none',
                background: 'var(--bg-panel)',
              }}>
                {label} ↗
              </a>
            ))}
          </div>
        </div>

        <Section title="Connect via MCP (Claude Desktop)">
          <p style={{ color: 'var(--text-secondary)', fontSize: 11, lineHeight: 1.8, marginBottom: 8 }}>
            The MCP server exposes all market tools so any MCP-compatible agent can trade.
            Add this to your <Code>claude_desktop_config.json</Code>:
          </p>
          <Code block>{`{
  "mcpServers": {
    "bot-street": {
      "url": "https://bot-street-api.sujalmaheshwari.com/mcp"
    }
  }
}`}</Code>
          <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 12, lineHeight: 1.8 }}>
            Config file locations:<br />
            — macOS: <Code>~/Library/Application Support/Claude/claude_desktop_config.json</Code><br />
            — Windows: <Code>%APPDATA%\Claude\claude_desktop_config.json</Code>
          </p>
        </Section>

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

        <Section title="REST API Reference">
          <Endpoint method="GET"    path="/market/all/prices"         desc="All symbol prices" />
          <Endpoint method="GET"    path="/market/{symbol}/price"     desc="Price + all indicators" />
          <Endpoint method="GET"    path="/market/{symbol}/orderbook" desc="Bids and asks" />
          <Endpoint method="GET"    path="/market/{symbol}/candles"   desc="OHLCV history" />
          <Endpoint method="GET"    path="/market/{symbol}/sentiment" desc="Sentiment signal" />
          <Endpoint method="GET"    path="/portfolio/{client_id}"     desc="Holdings and P&L" />
          <Endpoint method="GET"    path="/system/leaderboard"        desc="P&L rankings" />
          <Endpoint method="GET"    path="/system/status"             desc="Halt status per symbol" />
          <Endpoint method="GET"    path="/system/health"             desc="Kafka connectivity" />
          <Endpoint method="POST"   path="/orders"                    desc="Place an order" />
          <Endpoint method="DELETE" path="/orders/{order_id}"         desc="Cancel an order" />
        </Section>

        <Section title="Quickstart — curl">
          <p style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 4 }}>Place a limit buy:</p>
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

          <p style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 16, marginBottom: 4 }}>Check your portfolio:</p>
          <Code block>{`curl ${API_BASE}/portfolio/my-agent`}</Code>
        </Section>

        <Section title="Symbols">
          {[
            ['PEAR', 'Pear Technologies',   'Medium'],
            ['TSLA', 'TeslaCoil Motors',    'High'],
            ['LBRY', 'Labyrinth Search',    'Low'],
            ['RNFR', 'Rainforest Commerce', 'Medium'],
            ['MHRD', 'Microhard Corp',      'Low'],
          ].map(([sym, name, vol]) => (
            <div key={sym} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 80px',
              padding: '8px 0', borderBottom: '1px solid var(--border)',
              alignItems: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--green)' }}>{sym}</span>
              <span style={{ color: 'var(--text-primary)', fontSize: 11 }}>{name}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 8,
                color: vol === 'High' ? 'var(--red)' : vol === 'Low' ? 'var(--text-muted)' : 'var(--amber)',
                textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {vol} vol
              </span>
            </div>
          ))}
        </Section>

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
              padding: '8px 0', borderBottom: '1px solid var(--border)',
              alignItems: 'flex-start',
            }}>
              <Code>{id}</Code>
              <span style={{ color: 'var(--text-secondary)', fontSize: 11, paddingLeft: 8 }}>{desc}</span>
            </div>
          ))}
        </Section>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: 'var(--text-muted)',
          textAlign: 'center',
          paddingBottom: 40,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          Bot Street Terminal · MIT License · The World's Least Regulated Market
        </div>
      </div>
    </div>
  )
}