import { ArrowUpRight, Plus, ReceiptText, TrendingUp, Wallet, AlertCircle, PiggyBank } from 'lucide-react';
import { getInvoices, getExpenses, expenseTotal } from '../lib/store';
import { computeTotals, paidAmount, computeStatus, STATUS_META } from '../lib/invoice';
import { money } from '../lib/format';

const STATUS_COLORS = { draft: '#A89E94', sent: '#4F46E5', partial: '#F59E0B', paid: '#16A34A', overdue: '#F2643D' };

export default function Dashboard({ navigate, currency }) {
  const invoices = getInvoices();
  const expenses = getExpenses();
  const expTotal = expenseTotal();

  let earned = 0, outstanding = 0, overdue = 0;
  const buckets = { draft: 0, sent: 0, partial: 0, paid: 0, overdue: 0 };
  for (const inv of invoices) {
    if (inv.type === 'estimate') continue;
    const { total } = computeTotals(inv);
    const paid = paidAmount(inv);
    const status = computeStatus(inv);
    buckets[status] += total;
    earned += paid;
    if (status !== 'paid') outstanding += Math.max(total - paid, 0);
    if (status === 'overdue') overdue += Math.max(total - paid, 0);
  }

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-US', { month: 'short' }), earned: 0 });
  }
  for (const inv of invoices) {
    for (const p of inv.payments || []) {
      const d = new Date(`${p.date || ''}T00:00:00`);
      if (Number.isNaN(d.getTime())) continue;
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find((x) => x.key === k);
      if (m) m.earned += Number(p.amount) || 0;
    }
  }
  const maxMonth = Math.max(...months.map((m) => m.earned), 1);

  const donutSegments = Object.entries(buckets)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ key: k, value: v, color: STATUS_COLORS[k] }));

  const recent = [...invoices]
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 6);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Your money at a glance.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('#/app/invoices/new')}>
          <Plus size={16} /> New invoice
        </button>
      </div>

      <div className="kpi-grid">
        <Kpi icon={Wallet} label="Earned" value={money(earned, currency)} tint="green" />
        <Kpi icon={TrendingUp} label="Outstanding" value={money(outstanding, currency)} tint="indigo" />
        <Kpi icon={AlertCircle} label="Overdue" value={money(overdue, currency)} tint="coral" />
        <Kpi icon={PiggyBank} label="Expenses" value={money(expTotal, currency)} tint="amber" />
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-head">
            <h3>Earned — last 6 months</h3>
            <span className="card-note">by payment date</span>
          </div>
          <div className="bars">
            {months.map((m) => (
              <div className="bar-col" key={m.key}>
                <div className="bar-track">
                  <div className="bar" style={{ height: `${Math.max((m.earned / maxMonth) * 100, m.earned ? 4 : 2)}%` }} />
                </div>
                <span className="bar-label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Outstanding by status</h3>
            <span className="card-note">invoice totals</span>
          </div>
          <div className="donut-wrap">
            {donutSegments.length ? (
              <Donut segments={donutSegments} currency={currency} />
            ) : (
              <p className="field-hint">No invoices yet — create one to see the split.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Recent invoices</h3>
          <button className="link-btn" onClick={() => navigate('#/app/invoices')}>View all</button>
        </div>
        {recent.length === 0 ? (
          <div className="dash-empty">
            <ReceiptText size={22} />
            <p>Nothing here yet. Create your first invoice — it takes two minutes.</p>
          </div>
        ) : (
          <div className="table">
            {recent.map((inv) => {
              const { total, status } = summarizeLike(inv);
              return (
                <div className="table-row" key={inv.id} onClick={() => navigate(`#/app/invoices/${inv.id}`)}>
                  <div className="table-main">
                    <strong>{inv.number || '—'}</strong>
                    <span>{inv.client.name || 'Untitled'}</span>
                  </div>
                  <span className={`status-pill ${STATUS_META[status].cls}`}>{STATUS_META[status].label}</span>
                  <strong className="table-total">{money(total, inv.currency)}</strong>
                  <ArrowUpRight size={15} className="table-arrow" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function summarizeLike(inv) {
  const { total } = computeTotals(inv);
  return { total, status: computeStatus(inv) };
}

function Kpi({ icon: Icon, label, value, tint }) {
  return (
    <div className={`kpi ${tint}`}>
      <div className="kpi-icon"><Icon size={19} /></div>
      <div>
        <span className="kpi-label">{label}</span>
        <strong className="kpi-value">{value}</strong>
      </div>
    </div>
  );
}

function Donut({ segments, currency }) {
  const size = 170;
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  return (
    <div className="donut">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="18" />
        {segments.map((s) => {
          const dash = (s.value / total) * c;
          const el = (
            <circle
              key={s.key}
              cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth="18"
              strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="donut-center">
        <strong>{money(total, currency)}</strong>
        <span>total billed</span>
      </div>
      <div className="donut-legend">
        {segments.map((s) => (
          <span key={s.key}>
            <i style={{ background: s.color }} /> {STATUS_META[s.key]?.label}
          </span>
        ))}
      </div>
    </div>
  );
}
