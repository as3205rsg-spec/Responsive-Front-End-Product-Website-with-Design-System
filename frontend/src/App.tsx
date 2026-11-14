import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Cable,
  Check,
  CircleAlert,
  CircleCheck,
  CircleX,
  Database,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  api,
  apiPost,
  dateTime,
  label,
  money,
  numberValue,
  percent,
  toRecord,
  toRecords,
  type JsonRecord,
} from "./api";

type PageId = "overview" | "signals" | "paper" | "risk" | "research" | "market" | "intelligence" | "broker";

const NAV: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "signals", label: "Signal board", icon: Activity },
  { id: "paper", label: "Paper trading", icon: Wallet },
  { id: "risk", label: "Risk controls", icon: Shield },
  { id: "research", label: "Research lab", icon: FlaskConical },
  { id: "market", label: "Market data", icon: Database },
  { id: "intelligence", label: "ML & memory", icon: Sparkles },
  { id: "broker", label: "Broker gateway", icon: Cable },
];

const DEFAULT_SYMBOLS = ["NIFTY", "BANKNIFTY", "RELIANCE", "TCS", "INFY"];
const selectClass = "field-control";

function useApi<T>(path: string | null, revision = 0) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(path));

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    api<T>(path)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Unable to reach the AURA API.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, revision]);

  return { data, error, loading };
}

function App() {
  const [page, setPage] = useState<PageId>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const health = useApi<JsonRecord>("/health", revision);
  const backendReady = label(toRecord(health.data).status, "") === "ok";
  const activePage = NAV.find((item) => item.id === page) ?? NAV[0];
  const ActiveIcon = activePage.icon;

  const navigate = (next: PageId) => {
    setPage(next);
    setMobileNavOpen(false);
  };

  return (
    <div className="app-frame">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">AURA</div>
            <div className="brand-caption">INTELLIGENCE DESK</div>
          </div>
          <button className="icon-button sidebar-close" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {NAV.map(({ id, label: title, icon: Icon }) => (
            <button
              className={`nav-item ${page === id ? "nav-item-active" : ""}`}
              key={id}
              onClick={() => navigate(id)}
              aria-current={page === id ? "page" : undefined}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{title}</span>
              {page === id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-card">
            <div className="system-card-title">
              <span className={`status-dot ${backendReady ? "status-live" : "status-off"}`} />
              <span>{backendReady ? "API connected" : "API disconnected"}</span>
            </div>
            <p>{backendReady ? "AURA services responding" : "Waiting for backend service"}</p>
            {health.error && <small>{health.error}</small>}
          </div>
          <div className="sidebar-meta">
            <span>ENVIRONMENT</span>
            <strong><span className="status-dot status-paper" /> PAPER / SIMULATED</strong>
          </div>
          <div className="sidebar-footer">AURA V1 <span>·</span> Live trading disabled</div>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}

      <main className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button menu-button" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
              <Menu size={19} />
            </button>
            <div className="breadcrumb"><span>AURA</span><ArrowRight size={13} /><strong>{activePage.label}</strong></div>
          </div>
          <div className="topbar-right">
            <span className="market-state"><span className="pulse-dot" /> SIMULATOR</span>
            <span className="topbar-divider" />
            <span className="clock">{new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())} IST</span>
            <button className="icon-button refresh-button" onClick={() => setRevision((value) => value + 1)} aria-label="Refresh data">
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div className="page-heading-icon"><ActiveIcon size={18} /></div>
            <div>
              <div className="eyebrow">RISK-AWARE TRADING OPERATIONS</div>
              <h1>{activePage.label}</h1>
            </div>
            <div className="heading-status"><span className={`status-dot ${backendReady ? "status-live" : "status-off"}`} /> {backendReady ? "SYSTEM ONLINE" : "API OFFLINE"}</div>
          </div>

          {!backendReady && (
            <div className="connection-banner">
              <CircleAlert size={18} />
              <div>
                <strong>Backend connection required</strong>
                <span>Start the FastAPI service to load real system data. No market figures are simulated by this interface.</span>
              </div>
              <code>http://127.0.0.1:8000</code>
            </div>
          )}

          {page === "overview" && <Overview revision={revision} onNavigate={navigate} backendReady={backendReady} />}
          {page === "signals" && <Signals revision={revision} />}
          {page === "paper" && <PaperTrading revision={revision} />}
          {page === "risk" && <RiskMonitor revision={revision} />}
          {page === "research" && <Research revision={revision} />}
          {page === "market" && <MarketData revision={revision} />}
          {page === "intelligence" && <Intelligence revision={revision} />}
          {page === "broker" && <BrokerGateway revision={revision} />}

          <footer className="content-footer">
            <span>AURA QUANT PLATFORM</span>
            <span>Paper-first · Risk-gated · Live execution sealed</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function Overview({ revision, onNavigate, backendReady }: { revision: number; onNavigate: (page: PageId) => void; backendReady: boolean }) {
  const decisions = useApi<unknown>("/api/universe/decisions", revision);
  const book = useApi<JsonRecord>("/api/paper/book", revision);
  const risk = useApi<JsonRecord>("/api/paper/risk", revision);
  const realtime = useApi<JsonRecord>("/api/realtime/status", revision);
  const instruments = useApi<unknown>("/api/instruments", revision);
  const bars = useApi<unknown>(backendReady ? "/api/market/bars?symbol=NIFTY&timeframe=1D&limit=90" : null, revision);
  const rows = toRecords(decisions.data);
  const riskData = toRecord(risk.data);
  const bookData = toRecord(book.data);
  const barsData = toRecords(bars.data).map((bar) => ({
    time: dateTime(bar.t),
    close: numberValue(bar.c) ?? 0,
  }));
  const websocket = useRealtime(backendReady);

  return (
    <div className="page-stack">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">MARKET OVERVIEW <span className="live-dash" /></div>
          <h2>Decision support, with a hard risk veto.</h2>
          <p>One view across the AURA decision engine, paper book, and execution safeguards.</p>
        </div>
        <div className="sim-stamp"><span className="stamp-symbol">A</span><span><b>SIMULATED TAPE</b><small>Not a live exchange feed</small></span></div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Universe coverage" value={decisions.loading ? "…" : String(rows.length || "—")} detail={`${toRecords(instruments.data).length || "—"} canonical instruments`} icon={<BarChart3 size={17} />} />
        <MetricCard label="Paper book cash" value={bookData.cash === undefined ? "—" : money(bookData.cash)} detail={`${toRecords(bookData.positions).length} open positions`} icon={<Wallet size={17} />} />
        <MetricCard label="Daily P&L" value={bookData.dailyPnl === undefined ? "—" : money(bookData.dailyPnl)} detail={`Session NAV ${money(bookData.sessionStartNav)}`} icon={<Activity size={17} />} tone={Number(bookData.dailyPnl) >= 0 ? "positive" : "negative"} />
        <MetricCard label="Risk gate" value={riskData.canTrade === undefined ? "—" : riskData.canTrade ? "CLEAR" : "BLOCKED"} detail={`${toRecords(riskData.breaches).length || (Array.isArray(riskData.breaches) ? riskData.breaches.length : 0)} active breaches`} icon={<Shield size={17} />} tone={riskData.canTrade ? "positive" : riskData.canTrade === false ? "negative" : ""} />
      </div>

      <div className="dashboard-grid">
        <Panel title="NIFTY · Daily close" caption="Historical bars from the AURA market store" action={<span className="panel-tag"><Database size={12} /> MARKET STORE</span>}>
          <div className="chart-area">
            {barsData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={barsData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <defs><linearGradient id="niftyFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b6ed62" stopOpacity={0.22} /><stop offset="100%" stopColor="#b6ed62" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="#282d27" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: "#777f75", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={45} />
                  <YAxis domain={["dataMin - 100", "dataMax + 100"]} tick={{ fill: "#777f75", fontSize: 10 }} tickLine={false} axisLine={false} width={58} />
                  <Tooltip contentStyle={{ background: "#171b16", border: "1px solid #30372e", borderRadius: 8, color: "#e9eee4" }} />
                  <Area type="monotone" dataKey="close" stroke="#b6ed62" strokeWidth={2} fill="url(#niftyFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState loading={bars.loading} error={bars.error} text="NIFTY history is not available." />}
          </div>
        </Panel>

        <Panel title="System pulse" caption="Service health and stream gateway">
          <div className="pulse-list">
            <PulseRow label="FastAPI service" value={backendReady ? "Operational" : "Unavailable"} ok={backendReady} />
            <PulseRow label="Decision engine" value={decisions.error ? "Unavailable" : decisions.loading ? "Checking" : `${rows.length} decisions`} ok={!decisions.error && !decisions.loading} />
            <PulseRow label="Paper risk gate" value={risk.error ? "Unavailable" : riskData.canTrade ? "Clear" : "Blocked"} ok={!risk.error && Boolean(riskData.canTrade)} />
            <PulseRow label="WebSocket gateway" value={websocket.status} ok={websocket.status === "CONNECTED"} />
            <PulseRow label="Tick gateway" value={label(toRecord(realtime.data).status, realtime.error ? "Unavailable" : "Checking")} ok={!realtime.error && !realtime.loading} />
          </div>
          {websocket.message && <div className="event-note"><Zap size={14} /> Latest stream event · {websocket.message}</div>}
        </Panel>
      </div>

      <Panel title="Universe signals" caption="Decisions returned by the backend — open a signal to explore details" action={<button className="text-button" onClick={() => onNavigate("signals")}>Open signal board <ArrowRight size={14} /></button>}>
        <DecisionTable rows={rows.slice(0, 7)} loading={decisions.loading} error={decisions.error} />
      </Panel>

      <div className="quick-grid">
        <QuickLink icon={<Wallet size={17} />} title="Paper execution" description="Review positions, manage limits, and inspect fills." onClick={() => onNavigate("paper")} />
        <QuickLink icon={<FlaskConical size={17} />} title="Causal research" description="Run a backtest or walk-forward analysis." onClick={() => onNavigate("research")} />
        <QuickLink icon={<Shield size={17} />} title="Risk controls" description="Inspect the risk snapshot and active breaches." onClick={() => onNavigate("risk")} />
        <QuickLink icon={<Sparkles size={17} />} title="ML & evidence" description="Explore regime probabilities and pattern memory." onClick={() => onNavigate("intelligence")} />
      </div>
    </div>
  );
}

function Signals({ revision }: { revision: number }) {
  const signals = useApi<unknown>("/api/universe/decisions", revision);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("ALL");
  const filtered = useMemo(() => toRecords(signals.data).filter((row) => {
    const matchesText = `${label(row.symbol)} ${label(row.action)} ${label(row.risk)}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (action === "ALL" || row.action === action);
  }), [signals.data, query, action]);
  const [selected, setSelected] = useState<JsonRecord | null>(null);

  return (
    <div className="page-stack">
      <div className="page-intro"><div><h2>Universe decision board</h2><p>Decision outputs, probability, regime fit, and risk annotations are computed by the backend engine.</p></div><div className="small-stat">{filtered.length} <span>VISIBLE</span></div></div>
      <div className="toolbar">
        <label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter symbol or risk…" /></label>
        <div className="filter-pills">{["ALL", "BUY", "SELL", "HOLD", "SKIP"].map((item) => <button key={item} onClick={() => setAction(item)} className={action === item ? "filter-active" : ""}>{item}</button>)}</div>
      </div>
      <Panel title="Signals" caption="Click a row for the full backend decision record" action={<span className="panel-tag">ENGINE OUTPUT</span>}>
        <DecisionTable rows={filtered} loading={signals.loading} error={signals.error} onSelect={setSelected} />
      </Panel>
      {selected && <Modal title={`${label(selected.symbol)} · ${label(selected.action)}`} onClose={() => setSelected(null)}><JsonView value={selected} /></Modal>}
    </div>
  );
}

function PaperTrading({ revision }: { revision: number }) {
  const [reload, setReload] = useState(revision);
  const book = useApi<JsonRecord>("/api/paper/book", reload);
  const risk = useApi<JsonRecord>("/api/paper/risk", reload);
  const session = useApi<JsonRecord>("/api/paper/session", reload);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [symbol, setSymbol] = useState("RELIANCE");
  const bookData = toRecord(book.data);
  const positions = toRecords(bookData.positions);
  const orders = toRecords(bookData.orders);

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      symbol: String(form.get("symbol")).trim().toUpperCase(),
      side: String(form.get("side")),
      qty: Number(form.get("qty")),
      limitPrice: Number(form.get("limitPrice")),
      stop: Number(form.get("stop")),
      target: form.get("target") ? Number(form.get("target")) : null,
    };
    await runAction(async () => {
      const result = await apiPost<JsonRecord>("/api/paper/order", payload);
      setMessage(label(result.message, "Order submitted."));
      setReload((value) => value + 1);
    }, setBusy, setMessage);
  };

  const cancel = async (orderId: unknown) => {
    await runAction(async () => {
      const result = await apiPost<JsonRecord>("/api/paper/cancel", { orderId });
      setMessage(label(result.message, "Order cancelled."));
      setReload((value) => value + 1);
    }, setBusy, setMessage);
  };

  const matchTick = async () => {
    await runAction(async () => {
      const fills = await apiPost<unknown>("/api/paper/match-tick", {});
      setMessage(`${toRecords(fills).length} fill(s) processed against the latest simulator tick.`);
      setReload((value) => value + 1);
    }, setBusy, setMessage);
  };

  const reset = async () => {
    if (!window.confirm("Archive the current paper session and reset the book to its starting balance?")) return;
    await runAction(async () => {
      const result = await apiPost<JsonRecord>("/api/paper/reset", {});
      setMessage(label(result.message, "Paper book reset."));
      setReload((value) => value + 1);
    }, setBusy, setMessage);
  };

  return (
    <div className="page-stack">
      <div className="warning-banner"><Shield size={18} /><div><strong>Paper environment only</strong><span>Orders go to AURA’s simulator-backed book. This screen does not submit live broker orders.</span></div><span className="pill pill-paper">PAPER</span></div>
      <div className="metric-grid metric-grid-4">
        <MetricCard label="Cash balance" value={bookData.cash === undefined ? "—" : money(bookData.cash)} detail="Book cash" icon={<Wallet size={17} />} />
        <MetricCard label="Daily P&L" value={bookData.dailyPnl === undefined ? "—" : money(bookData.dailyPnl)} detail={`Realized ${money(bookData.realized)}`} icon={<Activity size={17} />} tone={Number(bookData.dailyPnl) >= 0 ? "positive" : "negative"} />
        <MetricCard label="Open positions" value={String(positions.length)} detail={`Session NAV ${money(bookData.sessionStartNav)}`} icon={<BarChart3 size={17} />} />
        <MetricCard label="Risk gate" value={toRecord(risk.data).canTrade ? "CLEAR" : risk.data ? "BLOCKED" : "—"} detail={label(toRecord(session.data).id, "Current session")} icon={<Shield size={17} />} tone={toRecord(risk.data).canTrade ? "positive" : risk.data ? "negative" : ""} />
      </div>
      {message && <MessageNotice message={message} onDismiss={() => setMessage("")} />}
      <div className="dashboard-grid">
        <Panel title="Paper order ticket" caption="Server-authoritative risk checks run on every order">
          <form className="order-form" onSubmit={placeOrder}>
            <div className="form-grid">
              <Field label="Instrument"><input name="symbol" value={symbol} onChange={(event) => setSymbol(event.target.value)} required /></Field>
              <Field label="Side"><select name="side" className={selectClass}><option>BUY</option><option>SELL</option></select></Field>
              <Field label="Quantity"><input name="qty" type="number" min="1" step="1" defaultValue="1" required /></Field>
              <Field label="Limit price (₹)"><input name="limitPrice" type="number" min="0.01" step="0.05" placeholder="Enter limit price" required /></Field>
              <Field label="Stop loss (₹)"><input name="stop" type="number" min="0.01" step="0.05" placeholder="Required by risk rules" required /></Field>
              <Field label="Target (₹)"><input name="target" type="number" min="0.01" step="0.05" placeholder="Optional" /></Field>
            </div>
            <button className="button button-primary" disabled={busy || book.loading}>{busy ? "Submitting…" : "Submit paper order"} <ArrowUpRight size={15} /></button>
          </form>
        </Panel>
        <Panel title="Positions" caption="Current server-side holdings">
          {book.error ? <ErrorText text={book.error} /> : positions.length ? <DataTable rows={positions} columns={[["symbol", "SYMBOL"], ["side", "SIDE"], ["qty", "QTY"], ["avgPrice", "AVG PRICE"], ["stop", "STOP"], ["target", "TARGET"]]} /> : <EmptyState loading={book.loading} text="No open positions in the paper book." />}
        </Panel>
      </div>
      <Panel title="Order blotter" caption="Recent paper orders" action={<div className="button-row"><button className="button button-secondary" disabled={busy} onClick={matchTick}><Zap size={14} /> Match simulator tick</button><button className="button button-quiet" disabled={busy} onClick={reset}>Reset session</button></div>}>
        {book.error ? <ErrorText text={book.error} /> : orders.length ? <DataTable rows={orders} columns={[["ts", "TIME"], ["symbol", "SYMBOL"], ["side", "SIDE"], ["qty", "QTY"], ["type", "TYPE"], ["limitPrice", "LIMIT"], ["status", "STATUS"], ["id", "ORDER ID"]]} action={(row) => row.status === "OPEN" ? <button className="text-button danger-text" onClick={() => cancel(row.id)}>Cancel</button> : null} /> : <EmptyState loading={book.loading} text="No orders have been placed in this session." />}
      </Panel>
      <Panel title="Recent fills" caption="Fill details and transaction costs">
        {book.error ? <ErrorText text={book.error} /> : toRecords(bookData.fills).length ? <DataTable rows={toRecords(bookData.fills)} columns={[["ts", "TIME"], ["symbol", "SYMBOL"], ["side", "SIDE"], ["qty", "QTY"], ["price", "FILL PRICE"], ["orderId", "ORDER"], ["costs", "COSTS"]]} /> : <EmptyState loading={book.loading} text="No fills recorded yet." />}
      </Panel>
    </div>
  );
}

function RiskMonitor({ revision }: { revision: number }) {
  const risk = useApi<JsonRecord>("/api/paper/risk", revision);
  const value = toRecord(risk.data);
  const breachList = Array.isArray(value.breaches) ? value.breaches.map((item) => String(item)) : [];
  const controls: [string, string, string, boolean | undefined][] = [
    ["Kill switch", value.killSwitch ? "ENGAGED" : "Disarmed", "Blocks new orders while engaged.", value.killSwitch === false],
    ["Daily loss breaker", value.dailyPnlPct === undefined ? "—" : percent(value.dailyPnlPct), "Configured max daily loss: 2% of starting capital.", numberValue(value.dailyPnlPct) !== null && Number(value.dailyPnlPct) > -0.02],
    ["Portfolio exposure", value.exposurePct === undefined ? "—" : percent(value.exposurePct), "Maximum allowed exposure: 80% of NAV.", numberValue(value.exposurePct) !== null && Number(value.exposurePct) <= 0.8],
    ["Open positions", label(value.openPositions), "Maximum simultaneous positions: 5.", numberValue(value.openPositions) !== null && Number(value.openPositions) < 5],
    ["Market data age", value.dataAgeMs === undefined ? "—" : `${label(value.dataAgeMs)} ms`, "Data older than 5 seconds is stale.", numberValue(value.dataAgeMs) !== null && Number(value.dataAgeMs) <= 5000],
    ["Execution environment", label(value.env), "Static IP is not required for the paper path.", value.livePathSealed === true],
  ];

  return (
    <div className="page-stack">
      <div className={`risk-summary ${value.canTrade ? "risk-clear" : value.canTrade === false ? "risk-blocked" : ""}`}>
        <div className="risk-summary-icon">{value.canTrade ? <CircleCheck size={21} /> : <CircleAlert size={21} />}</div>
        <div><div className="eyebrow">SERVER-SIDE RISK SNAPSHOT</div><h2>{value.canTrade === undefined ? "Awaiting risk state" : value.canTrade ? "Order gate clear" : "New orders are blocked"}</h2><p>{value.canTrade ? "Risk engine reports no active breaches. Each submitted order is checked again server-side." : breachList.join(" · ") || risk.error || "Risk snapshot is not available."}</p></div>
        <span className={`pill ${value.canTrade ? "pill-green" : "pill-red"}`}>{value.canTrade === undefined ? "UNKNOWN" : value.canTrade ? "CAN TRADE" : "NO TRADE"}</span>
      </div>
      <div className="risk-grid">{controls.map(([title, current, detail, ok]) => <div className="risk-rule" key={title}><div className="risk-rule-head"><span>{title}</span>{ok === undefined ? <span className="pill">UNKNOWN</span> : <span className={`pill ${ok ? "pill-green" : "pill-red"}`}>{ok ? "PASS" : "CHECK"}</span>}</div><strong>{current}</strong><p>{detail}</p></div>)}</div>
      <Panel title="Risk breaches" caption="Returned directly from the backend risk engine">{risk.error ? <ErrorText text={risk.error} /> : breachList.length ? <div className="breach-list">{breachList.map((item) => <div key={item}><CircleX size={15} />{item}</div>)}</div> : <EmptyState loading={risk.loading} text="No active breaches reported." />}</Panel>
      <div className="note-banner"><Shield size={16} /><span>Safety boundary: live order execution is disabled by default in AURA. This frontend intentionally has no live-order control.</span></div>
    </div>
  );
}

function Research({ revision }: { revision: number }) {
  const strategies = useApi<unknown>("/api/quant/strategies", revision);
  const runs = useApi<unknown>("/api/research/runs", revision);
  const strategyList = toRecords(strategies.data);
  const [strategyId, setStrategyId] = useState("vwap_rsi");
  const [symbol, setSymbol] = useState("RELIANCE");
  const [result, setResult] = useState<JsonRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const metrics = toRecord(result?.metrics);
  const trades = toRecords(result?.trades);
  const equity = toRecords(metrics.equityCurve).map((point) => ({ time: dateTime(point.t), equity: numberValue(point.equity) ?? 0 }));

  const runBacktest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction(async () => {
      const data = await apiPost<JsonRecord>("/api/research/backtest", {
        strategyId,
        symbol: String(form.get("symbol")).trim().toUpperCase(),
        timeframe: String(form.get("timeframe")),
        initialCapital: Number(form.get("initialCapital")),
        maxPositionPct: Number(form.get("maxPositionPct")),
        limitBars: Number(form.get("limitBars")),
      });
      setResult(data);
      setMessage(`Backtest complete · ${label(data.runId)}`);
    }, setBusy, setMessage);
  };

  const runWalkForward = async () => {
    await runAction(async () => {
      const data = await apiPost<JsonRecord>("/api/research/walk-forward", {
        strategyId,
        symbol: symbol.trim().toUpperCase(),
        paramGrid: [],
        trainBars: 150,
        testBars: 40,
        stepBars: 40,
      });
      setResult({ walkForward: data });
      setMessage("Walk-forward validation complete.");
    }, setBusy, setMessage);
  };

  return (
    <div className="page-stack">
      <div className="note-banner"><FlaskConical size={16} /><span>Research results use the backend’s stored historical bars and causal backtester. They are not a forecast or a promise of future performance.</span></div>
      <Panel title="Research configuration" caption="Choose a registered quant strategy and backtest parameters">
        <form className="research-form" onSubmit={runBacktest}>
          <Field label="Strategy"><select className={selectClass} value={strategyId} onChange={(event) => setStrategyId(event.target.value)}>{strategyList.length ? strategyList.map((strategy) => <option key={label(strategy.id)} value={label(strategy.id)}>{label(strategy.name, label(strategy.id))}</option>) : <option value="vwap_rsi">VWAP + RSI (vwap_rsi)</option>}</select></Field>
          <Field label="Symbol"><input name="symbol" value={symbol} onChange={(event) => setSymbol(event.target.value)} required /></Field>
          <Field label="Timeframe"><select name="timeframe" className={selectClass}><option>1D</option><option>5m</option><option>1m</option></select></Field>
          <Field label="Initial capital (₹)"><input name="initialCapital" type="number" min="10000" step="10000" defaultValue="1000000" /></Field>
          <Field label="Max position (%)"><input name="maxPositionPct" type="number" min="0.01" max="1" step="0.01" defaultValue="0.1" /></Field>
          <Field label="Bars"><input name="limitBars" type="number" min="40" max="500" step="10" defaultValue="500" /></Field>
          <div className="research-actions"><button className="button button-primary" disabled={busy}>{busy ? "Running…" : "Run causal backtest"} <ArrowUpRight size={15} /></button><button type="button" className="button button-secondary" disabled={busy} onClick={runWalkForward}>Walk-forward <ArrowRight size={14} /></button></div>
        </form>
        {message && <div className="inline-result"><Check size={15} />{message}</div>}
        {strategies.error && <ErrorText text={strategies.error} />}
      </Panel>

      {result && (
        <Panel title={result.runId ? `Backtest · ${label(result.symbol)} · ${label(result.strategyId)}` : "Walk-forward result"} caption={result.runId ? `Run ${label(result.runId)} · ${label(result.timeframe)}` : "Rolling in-sample / out-of-sample validation"}>
          {result.metrics ? <div className="page-stack compact">
            <div className="metric-grid metric-grid-4">
              <MetricCard label="Net P&L" value={money(metrics.netPnl)} detail={`${percent(metrics.netPnlPct)} return`} icon={<Wallet size={17} />} tone={Number(metrics.netPnl) >= 0 ? "positive" : "negative"} />
              <MetricCard label="Sharpe ratio" value={label(metrics.sharpeRatio)} detail={`Sortino ${label(metrics.sortinoRatio)}`} icon={<Gauge size={17} />} />
              <MetricCard label="Win rate" value={percent(metrics.winRate)} detail={`${label(metrics.totalTrades)} trades`} icon={<Activity size={17} />} />
              <MetricCard label="Max drawdown" value={percent(metrics.maxDrawdownPct)} detail={`Costs ${money(metrics.totalCosts)}`} icon={<ArrowDownRight size={17} />} tone="negative" />
            </div>
            {equity.length > 0 && <div className="chart-area chart-large"><ResponsiveContainer width="100%" height="100%"><AreaChart data={equity}><defs><linearGradient id="equityFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b6ed62" stopOpacity={0.22} /><stop offset="100%" stopColor="#b6ed62" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#282d27" vertical={false} /><XAxis dataKey="time" tick={{ fill: "#777f75", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={40} /><YAxis tick={{ fill: "#777f75", fontSize: 10 }} tickLine={false} axisLine={false} width={70} /><Tooltip contentStyle={{ background: "#171b16", border: "1px solid #30372e", borderRadius: 8, color: "#e9eee4" }} /><Area type="monotone" dataKey="equity" stroke="#b6ed62" strokeWidth={2} fill="url(#equityFill)" /></AreaChart></ResponsiveContainer></div>}
            {trades.length > 0 && <DataTable rows={trades} columns={[["tradeNum", "#"], ["side", "SIDE"], ["qty", "QTY"], ["entryPx", "ENTRY"], ["exitPx", "EXIT"], ["netPnl", "NET P&L"], ["rMultiple", "R"], ["exitReason", "EXIT REASON"]]} />}
          </div> : <JsonView value={toRecord(result.walkForward)} />}
        </Panel>
      )}

      <Panel title="Recent runs" caption="Backtest run summaries retained by the active backend process">
        {runs.error ? <ErrorText text={runs.error} /> : toRecords(runs.data).length ? <DataTable rows={toRecords(runs.data)} columns={[["runId", "RUN"], ["symbol", "SYMBOL"], ["strategyId", "STRATEGY"], ["netPnl", "NET P&L"], ["sharpeRatio", "SHARPE"], ["winRate", "WIN RATE"], ["totalTrades", "TRADES"]]} /> : <EmptyState loading={runs.loading} text="No backtest runs have been recorded in this process." />}
      </Panel>
    </div>
  );
}

function MarketData({ revision }: { revision: number }) {
  const instruments = useApi<unknown>("/api/instruments?active_only=true", revision);
  const datasets = useApi<unknown>("/api/datasets", revision);
  const [symbol, setSymbol] = useState("NIFTY");
  const [timeframe, setTimeframe] = useState("1D");
  const bars = useApi<unknown>(`/api/market/bars?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}&limit=200`, revision);
  const [audit, setAudit] = useState<JsonRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const instrumentsData = toRecords(instruments.data);
  const datasetList = toRecords(datasets.data);
  const barList = toRecords(bars.data);
  const chartData = barList.map((bar) => ({ time: dateTime(bar.t), close: numberValue(bar.c) ?? 0, volume: numberValue(bar.v) ?? 0 }));

  const runAudit = async (datasetVersionId: unknown) => {
    await runAction(async () => {
      const response = await apiPost<JsonRecord>("/api/datasets/audit", { datasetVersionId });
      setAudit(response);
      setMessage(`Quality audit ${label(response.status)} · ${label(response.datasetVersionId)}`);
    }, setBusy, setMessage);
  };

  const instrument = instrumentsData.find((item) => item.symbol === symbol);

  return (
    <div className="page-stack">
      <Panel title="Historical market data" caption="OHLCV bars served by the AURA market store">
        <div className="toolbar market-toolbar">
          <Field label="Instrument"><select className={selectClass} value={symbol} onChange={(event) => setSymbol(event.target.value)}>{instrumentsData.length ? instrumentsData.map((item) => <option key={label(item.id)} value={label(item.symbol)}>{label(item.symbol)} · {label(item.name)}</option>) : DEFAULT_SYMBOLS.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Timeframe"><select className={selectClass} value={timeframe} onChange={(event) => setTimeframe(event.target.value)}>{["1m", "3m", "5m", "15m", "1D"].map((item) => <option key={item}>{item}</option>)}</select></Field>
          {instrument && <div className="instrument-summary"><strong>{label(instrument.name)}</strong><span>{label(instrument.exchange)} · {label(instrument.segment)} · {label(instrument.sector)}</span></div>}
        </div>
        <div className="chart-area chart-large">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="marketFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b6ed62" stopOpacity={0.2} /><stop offset="100%" stopColor="#b6ed62" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#282d27" vertical={false} /><XAxis dataKey="time" tick={{ fill: "#777f75", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={45} /><YAxis domain={["dataMin - 20", "dataMax + 20"]} tick={{ fill: "#777f75", fontSize: 10 }} tickLine={false} axisLine={false} width={62} /><Tooltip contentStyle={{ background: "#171b16", border: "1px solid #30372e", borderRadius: 8, color: "#e9eee4" }} /><Area type="monotone" dataKey="close" stroke="#b6ed62" strokeWidth={2} fill="url(#marketFill)" /></AreaChart></ResponsiveContainer> : <EmptyState loading={bars.loading} error={bars.error} text="No bars returned for this query." />}</div>
        <div className="chart-caption"><span>{barList.length} bars loaded</span><span>Adjusted OHLCV · API source</span></div>
      </Panel>

      <Panel title="Dataset lineage" caption="Immutable datasets available to the backend" action={<span className="panel-tag"><Database size={12} /> {datasetList.length} DATASETS</span>}>
        {message && <MessageNotice message={message} />}
        {datasets.error ? <ErrorText text={datasets.error} /> : datasetList.length ? <DataTable rows={datasetList} columns={[["name", "DATASET"], ["source", "SOURCE"], ["symbolCount", "SYMBOLS"], ["barCount", "BARS"], ["createdAt", "CREATED"], ["checksum", "CHECKSUM"]]} action={(row) => <button className="text-button" disabled={busy} onClick={() => runAudit(row.id)}>Run audit</button>} /> : <EmptyState loading={datasets.loading} text="No dataset versions are available." />}
      </Panel>
      {audit && <Panel title="Latest quality audit" caption="Validation report from the market-data quality checks"><JsonView value={audit} /></Panel>}
      <Panel title="Instrument master" caption="Canonical symbols and exchange metadata">
        {instruments.error ? <ErrorText text={instruments.error} /> : instrumentsData.length ? <DataTable rows={instrumentsData.slice(0, 40)} columns={[["symbol", "SYMBOL"], ["name", "NAME"], ["exchange", "EXCHANGE"], ["segment", "SEGMENT"], ["sector", "SECTOR"], ["lotSize", "LOT"], ["tickSize", "TICK"], ["isActive", "ACTIVE"]]} /> : <EmptyState loading={instruments.loading} text="No canonical instruments are available." />}
      </Panel>
    </div>
  );
}

function Intelligence({ revision }: { revision: number }) {
  const drift = useApi<unknown>("/api/ml/drift", revision);
  const driftSummary = useApi<JsonRecord>("/api/ml/drift/summary", revision);
  const calibrators = useApi<unknown>("/api/ml/calibrators", revision);
  const patternDefinitions = useApi<unknown>("/api/similarity/patterns/list", revision);
  const memoryStats = useApi<JsonRecord>("/api/similarity/stats", revision);
  const [symbol, setSymbol] = useState("NIFTY");
  const [insight, setInsight] = useState<JsonRecord | null>(null);
  const [patterns, setPatterns] = useState<unknown>(null);
  const [memory, setMemory] = useState<JsonRecord | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const runActionLocal = (fn: () => Promise<void>) => runAction(fn, setBusy, setMessage);
  const runInsight = () => runActionLocal(async () => {
    setInsight(await apiPost<JsonRecord>("/api/ml/insight", { symbol, timeframe: "1D" }));
    setMessage(`ML insight refreshed for ${symbol}.`);
  });
  const scanPatterns = () => runActionLocal(async () => {
    setPatterns(await apiPost<unknown>("/api/similarity/patterns", { symbol, timeframe: "1D", activatedOnly: false }));
    setMessage(`Pattern scan complete for ${symbol}.`);
  });
  const queryMemory = () => runActionLocal(async () => {
    setMemory(await apiPost<JsonRecord>("/api/similarity/query", { symbol, timeframe: "1D", topK: 10, minSimilarity: 0.7 }));
    setMessage(`Evidence memory queried for ${symbol}.`);
  });
  const storeMemory = () => runActionLocal(async () => {
    const response = await apiPost<JsonRecord>("/api/similarity/store", { symbol, timeframe: "1D" });
    setMessage(`Evidence stored · ${label(response.entryId)}.`);
  });
  const fitCalibrator = (name: unknown) => runActionLocal(async () => {
    const response = await apiPost<JsonRecord>("/api/ml/calibrate/fit", { calibratorName: name });
    setMessage(label(response.message, response.ok ? `Calibrator ${label(name)} fitted.` : "Not enough samples to fit this calibrator."));
  });

  return (
    <div className="page-stack">
      <div className="note-banner"><Sparkles size={16} /><span>Model outputs and pattern matches are decision support. They are not orders, guarantees, or evidence of predictive performance.</span></div>
      <div className="toolbar intelligence-toolbar">
        <Field label="Instrument"><select className={selectClass} value={symbol} onChange={(event) => setSymbol(event.target.value)}>{DEFAULT_SYMBOLS.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <div className="button-row">
          <button className="button button-primary" disabled={busy} onClick={runInsight}><Sparkles size={14} /> Run ML insight</button>
          <button className="button button-secondary" disabled={busy} onClick={scanPatterns}>Scan patterns</button>
          <button className="button button-secondary" disabled={busy} onClick={queryMemory}>Query memory</button>
          <button className="button button-quiet" disabled={busy} onClick={storeMemory}>Store state</button>
        </div>
      </div>
      {message && <MessageNotice message={message} />}
      <div className="dashboard-grid">
        <Panel title="ML insight" caption="Regime probability and direction signal">
          {insight ? <JsonView value={insight} /> : <EmptyState text="Run an ML insight to load regime and directional probabilities." />}
        </Panel>
        <Panel title="Feature drift" caption="PSI / z-score drift monitor" action={<span className="panel-tag">{label(toRecord(driftSummary.data).status, "MONITOR")}</span>}>
          {drift.error ? <ErrorText text={drift.error} /> : <DataTable rows={toRecords(drift.data).slice(0, 8)} columns={[["feature", "FEATURE"], ["status", "STATUS"], ["psi", "PSI"], ["zScore", "Z-SCORE"], ["sampleCount", "SAMPLES"]]} />}
        </Panel>
      </div>
      <Panel title="Pattern library" caption="Registered pattern definitions and activation results">
        <div className="subsection-title">Registered patterns</div>
        {patternDefinitions.error ? <ErrorText text={patternDefinitions.error} /> : <DataTable rows={toRecords(patternDefinitions.data)} columns={[["name", "PATTERN"], ["expectedBias", "BIAS"], ["impliedAction", "ACTION"], ["activationThreshold", "THRESHOLD"], ["description", "DESCRIPTION"]]} />}
        {patterns !== null && <div className="result-spacer"><div className="subsection-title">Latest scan</div><JsonView value={patterns} /></div>}
      </Panel>
      <div className="dashboard-grid">
        <Panel title="Evidence memory" caption="Cosine-similarity store with outcome tagging">
          <div className="inline-stat-grid"><div><span>ENTRIES</span><strong>{label(toRecord(memoryStats.data).totalEntries, "—")}</strong></div><div><span>TAGGED OUTCOMES</span><strong>{label(toRecord(memoryStats.data).taggedEntries, "—")}</strong></div></div>
          {memory && <div className="result-spacer"><JsonView value={memory} /></div>}
        </Panel>
        <Panel title="Probability calibrators" caption="Platt / isotonic calibration state">
          {calibrators.error ? <ErrorText text={calibrators.error} /> : toRecords(calibrators.data).length ? <DataTable rows={toRecords(calibrators.data)} columns={[["name", "NAME"], ["method", "METHOD"], ["isReady", "READY"], ["sampleCount", "SAMPLES"]]} action={(row) => <button className="text-button" disabled={busy} onClick={() => fitCalibrator(row.name)}>Fit</button>} /> : <EmptyState loading={calibrators.loading} text="No calibrators registered." />}
        </Panel>
      </div>
      <Panel title="Drift summary" caption="Counts by current status"><JsonView value={toRecord(driftSummary.data)} /></Panel>
    </div>
  );
}

function BrokerGateway({ revision }: { revision: number }) {
  const status = useApi<JsonRecord>("/api/broker/status", revision);
  const config = useApi<JsonRecord>("/api/broker/config", revision);
  const audit = useApi<unknown>("/api/broker/audit?limit=30", revision);
  const [ping, setPing] = useState<JsonRecord | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const runPing = async () => {
    setBusy(true);
    setError("");
    try {
      setPing(await apiPost<JsonRecord>("/api/broker/ping", {}));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gateway ping failed.");
    } finally {
      setBusy(false);
    }
  };
  const configData = toRecord(config.data);
  const statusData = toRecord(status.data);

  return (
    <div className="page-stack">
      <div className="warning-banner warning-red"><Shield size={18} /><div><strong>Live execution is sealed</strong><span>Broker connectivity and audit visibility are available; this frontend does not expose a live order form.</span></div><span className="pill pill-red">LIVE DISABLED</span></div>
      <div className="metric-grid metric-grid-4">
        <MetricCard label="Gateway status" value={label(statusData.status, "—")} detail="OpenAlgo broker connection" icon={<Cable size={17} />} />
        <MetricCard label="Live trading" value={configData.liveEnabled ? "ENABLED" : "DISABLED"} detail="AURA_LIVE_TRADING gate" icon={<Shield size={17} />} tone={configData.liveEnabled ? "negative" : "positive"} />
        <MetricCard label="API key" value={configData.apiKeyConfigured ? "CONFIGURED" : "NOT CONFIGURED"} detail="Key presence only; never shown here" icon={<Check size={17} />} />
        <MetricCard label="Last latency" value={statusData.lastLatencyMs === undefined ? "—" : `${label(statusData.lastLatencyMs)} ms`} detail="Broker status response" icon={<Gauge size={17} />} />
      </div>
      <Panel title="Gateway configuration" caption="Safe-to-display configuration only">
        <div className="config-grid">{Object.entries(configData).map(([key, value]) => <div className="config-item" key={key}><span>{key.replace(/[A-Z]/g, (letter) => ` ${letter}`).toUpperCase()}</span><strong>{label(value)}</strong></div>)}</div>
        <div className="button-row gateway-actions"><button className="button button-secondary" onClick={runPing} disabled={busy}><Cable size={14} />{busy ? "Pinging…" : "Ping OpenAlgo gateway"}</button>{ping && <span className="inline-result"><CircleCheck size={15} />{label(ping.latencyMs)} ms · reachable</span>}</div>
        {error && <ErrorText text={error} />}
      </Panel>
      <Panel title="Order audit trail" caption="Most recent broker router attempts">
        {audit.error ? <ErrorText text={audit.error} /> : toRecords(audit.data).length ? <DataTable rows={toRecords(audit.data)} columns={[["timestamp", "TIME"], ["symbol", "SYMBOL"], ["action", "ACTION"], ["quantity", "QTY"], ["env", "ENV"], ["routedTo", "ROUTED TO"], ["status", "STATUS"], ["rejectionReason", "RESULT"]]} /> : <EmptyState loading={audit.loading} text="No broker orders have been routed." />}
      </Panel>
      <Panel title="Broker state" caption="Status reported by the backend broker client"><JsonView value={statusData} /></Panel>
    </div>
  );
}

function useRealtime(enabled: boolean) {
  const [status, setStatus] = useState(enabled ? "CONNECTING" : "OFFLINE");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!enabled) {
      setStatus("OFFLINE");
      return;
    }
    const scheme = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${scheme}//${window.location.host}/ws/stream`);
    let cleanupRequested = false;
    socket.onopen = () => {
      if (cleanupRequested) {
        socket.close();
        return;
      }
      setStatus("CONNECTED");
      socket.send(JSON.stringify({ action: "subscribe", topics: ["quotes:NIFTY", "quotes:BANKNIFTY", "signals", "risk", "fills"] }));
    };
    socket.onmessage = (event) => {
      try {
        const data = toRecord(JSON.parse(String(event.data)));
        setMessage(`${label(data.type, "event")} · ${new Date().toLocaleTimeString("en-IN")}`);
      } catch {
        setMessage("Stream event received");
      }
    };
    socket.onerror = () => setStatus("UNAVAILABLE");
    socket.onclose = () => setStatus((current) => current === "CONNECTED" ? "DISCONNECTED" : current);
    return () => {
      cleanupRequested = true;
      if (socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, [enabled]);
  return { status, message };
}

function DecisionTable({ rows, loading, error, onSelect }: { rows: JsonRecord[]; loading: boolean; error: string; onSelect?: (row: JsonRecord) => void }) {
  if (error) return <ErrorText text={error} />;
  if (loading && rows.length === 0) return <EmptyState loading text="Loading decisions from the backend…" />;
  if (rows.length === 0) return <EmptyState text="No decision rows match this filter." />;
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr>{["SYMBOL", "ACTION", "CONFIDENCE", "P(UP)", "RISK", "REGIME", "STRATEGY"].map((head) => <th key={head}>{head}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => {
          const regime = toRecord(row.regime);
          const strategy = toRecord(row.strategy);
          return <tr key={label(row.id, `${label(row.symbol)}-${index}`)} onClick={() => onSelect?.(row)} className={onSelect ? "clickable-row" : ""}>
            <td><strong className="symbol-cell">{label(row.symbol)}</strong><small>{label(row.lineage ? toRecord(row.lineage).datasetVersion : null, "AURA universe")}</small></td>
            <td><ActionPill value={row.action} /></td>
            <td>{percent(row.confidence)}</td><td>{percent(row.probabilityUp)}</td>
            <td><RiskPill value={row.risk} /></td><td>{label(regime.label)}</td>
            <td>{label(strategy.strategyId)} <span className="muted">{label(strategy.version)}</span></td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  );
}

function DataTable({ rows, columns, action }: { rows: JsonRecord[]; columns: [string, string][]; action?: (row: JsonRecord) => ReactNode }) {
  if (rows.length === 0) return <div className="empty-inline">No data returned.</div>;
  return <div className="table-scroll"><table className="data-table"><thead><tr>{columns.map(([, title]) => <th key={title}>{title}</th>)}{action && <th />}</tr></thead><tbody>{rows.map((row, index) => <tr key={label(row.id, label(row.runId, String(index)))}>{columns.map(([key]) => <td key={key}>{cellValue(row[key], key)}</td>)}{action && <td className="table-action">{action(row)}</td>}</tr>)}</tbody></table></div>;
}

function cellValue(value: unknown, key: string): ReactNode {
  if (value === null || value === undefined || value === "") return <span className="muted">—</span>;
  if (key.toLowerCase().includes("time") || key === "ts" || key === "timestamp") return dateTime(value);
  if (typeof value === "boolean") return value ? <span className="good-value">YES</span> : <span className="muted">NO</span>;
  if (typeof value === "number") {
    if (key.toLowerCase().includes("price") || key.toLowerCase().includes("pnl") || key.toLowerCase().includes("cash") || key.toLowerCase().includes("cost")) return money(value);
    if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("prob") || key.toLowerCase().includes("pct") || key.toLowerCase().includes("threshold")) return percent(value);
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 }).format(value);
  }
  if (typeof value === "object") return <span title={JSON.stringify(value)}>{JSON.stringify(value)}</span>;
  return String(value);
}

function ActionPill({ value }: { value: unknown }) {
  const action = label(value, "NO SIGNAL");
  const tone = action === "BUY" ? "positive" : action === "SELL" ? "negative" : "neutral";
  return <span className={`pill pill-${tone}`}>{action}</span>;
}

function RiskPill({ value }: { value: unknown }) {
  const risk = label(value, "—");
  return <span className={`risk-text ${risk === "LOW" ? "good-value" : risk === "HIGH" || risk === "BLOCKED" ? "bad-value" : ""}`}>{risk}</span>;
}

function MetricCard({ label: title, value, detail, icon, tone = "" }: { label: string; value: string; detail: string; icon: ReactNode; tone?: string }) {
  return <div className="metric-card"><div className="metric-top"><span>{title}</span><span className="metric-icon">{icon}</span></div><strong className={tone ? `${tone}-text` : ""}>{value}</strong><small>{detail}</small></div>;
}

function Panel({ title, caption, action, children }: { title: string; caption?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="panel"><div className="panel-header"><div><h3>{title}</h3>{caption && <p>{caption}</p>}</div>{action}</div><div className="panel-body">{children}</div></section>;
}

function Field({ label: title, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{title}</span>{children}</label>;
}

function EmptyState({ loading = false, error, text }: { loading?: boolean; error?: string; text: string }) {
  return <div className="empty-state">{error ? <CircleAlert size={17} /> : loading ? <RefreshCw className="spin" size={16} /> : <Database size={17} />}<span>{error || text}</span></div>;
}

function MessageNotice({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  const isError = message.startsWith("Error:");
  return <div className={`notice ${isError ? "notice-error" : ""}`}>{isError ? <CircleAlert size={16} /> : <CircleCheck size={16} />}{message}{onDismiss && <button className="notice-close" onClick={onDismiss} aria-label="Dismiss"><X size={14} /></button>}</div>;
}

function ErrorText({ text }: { text: string }) {
  return <div className="error-text"><CircleAlert size={15} />{text}</div>;
}

function JsonView({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <div className="empty-inline">No response data yet.</div>;
  return <pre className="json-view">{JSON.stringify(value, null, 2)}</pre>;
}

function PulseRow({ label: title, value, ok }: { label: string; value: string; ok: boolean }) {
  return <div className="pulse-row"><span><span className={`status-dot ${ok ? "status-live" : "status-off"}`} />{title}</span><strong>{value}</strong></div>;
}

function QuickLink({ icon, title, description, onClick }: { icon: ReactNode; title: string; description: string; onClick: () => void }) {
  return <button className="quick-link" onClick={onClick}><span className="quick-icon">{icon}</span><span><strong>{title}</strong><small>{description}</small></span><ArrowRight size={15} /></button>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal"><div className="modal-header"><h3>{title}</h3><button className="icon-button" onClick={onClose} aria-label="Close details"><X size={18} /></button></div>{children}</div></div>;
}

function runAction(action: () => Promise<void>, setBusy: (busy: boolean) => void, setMessage: (message: string) => void) {
  setBusy(true);
  setMessage("");
  void action().catch((cause: unknown) => setMessage(`Error: ${cause instanceof Error ? cause.message : "Request failed."}`)).finally(() => setBusy(false));
}

export default App;
