import { useMemo, useState } from 'react';
import {
  Plus, Search, Trash2, CopyPlus, History, FileText, Briefcase, Link2, Clock, Check,
} from 'lucide-react';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { getInvoices, deleteInvoice, saveInvoice, getInvoice } from '../lib/store';
import { computeTotals, computeStatus, STATUS_META, paidAmount, uid } from '../lib/invoice';
import { money, fmtDate } from '../lib/format';

export default function Invoices({ navigate, onToast }) {
  const [query, setQuery] = useState('');
  const [historyFor, setHistoryFor] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const invoices = useMemo(() => {
    const list = getInvoices();
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter((i) =>
          `${i.number} ${i.client?.name || ''} ${i.type}`.toLowerCase().includes(q)
        )
      : list;
    return filtered.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }, [query, refresh]);

  const bump = () => setRefresh((n) => n + 1);

  const duplicate = (inv) => {
    const copy = {
      ...inv,
      id: uid(),
      number: '',
      sentAt: null,
      payments: [],
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveInvoice(copy);
    bump();
    onToast('Duplicate created — open it to number & save');
    navigate(`#/app/invoices/${copy.id}`);
  };

  const restoreVersion = (inv, version) => {
    saveInvoice({ ...version.data, id: inv.id, versions: inv.versions });
    bump();
    onToast(`Restored version from ${fmtDate(version.at.slice(0, 10))}`);
  };

  const copyLink = async (id) => {
    const link = `${location.origin}${location.pathname}#/i/${id}`;
    try {
      await navigator.clipboard.writeText(link);
      onToast('Link copied');
    } catch {
      onToast(link);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Invoices</h1>
          <p>{invoices.length} {invoices.length === 1 ? 'document' : 'documents'} — estimates and invoices together.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => navigate('#/app/invoices/new')}>
            <Briefcase size={16} /> New estimate
          </button>
          <button className="btn btn-primary" onClick={() => navigate('#/app/invoices/new')}>
            <Plus size={16} /> New invoice
          </button>
        </div>
      </div>

      <div className="search-row">
        <Search size={16} />
        <input
          className="input"
          placeholder="Search by number, client…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {invoices.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title={query ? 'No matches' : 'No invoices yet'}
            desc={query ? 'Try a different search.' : 'Create your first invoice — it takes about two minutes.'}
            action={
              <button className="btn btn-primary btn-sm" onClick={() => navigate('#/app/invoices/new')}>
                <Plus size={14} /> Create invoice
              </button>
            }
          />
        </div>
      ) : (
        <div className="card">
          <div className="table">
            {invoices.map((inv) => {
              const { total } = computeTotals(inv);
              const status = computeStatus(inv);
              const paid = paidAmount(inv);
              const meta = STATUS_META[status];
              return (
                <div className="table-row invoice-row" key={inv.id}>
                  <div className="table-main" onClick={() => navigate(`#/app/invoices/${inv.id}`)}>
                    <div className="table-title">
                      <strong>{inv.number || 'Unnumbered'}</strong>
                      {inv.type === 'estimate' && <span className="type-badge estimate">Estimate</span>}
                    </div>
                    <span>{inv.client?.name || 'Untitled client'} · issued {fmtDate(inv.meta.issueDate)}</span>
                  </div>
                  <span className={`status-pill ${meta.cls}`}>{meta.label}</span>
                  <div className="table-total">
                    <strong>{money(total, inv.currency)}</strong>
                    {status === 'partial' && <span>{money(paid, inv.currency)} paid</span>}
                  </div>
                  <div className="row-actions">
                    <button className="icon-btn" title="Open" onClick={() => navigate(`#/app/invoices/${inv.id}`)}><FileText size={15} /></button>
                    <button className="icon-btn" title="Copy public link" onClick={() => copyLink(inv.id)}><Link2 size={15} /></button>
                    <button className="icon-btn" title="Duplicate" onClick={() => duplicate(inv)}><CopyPlus size={15} /></button>
                    <button className="icon-btn" title="Version history" onClick={() => setHistoryFor(inv)}><History size={15} /></button>
                    <button className="icon-btn danger" title="Delete" onClick={() => { if (window.confirm(`Delete ${inv.number}?`)) { deleteInvoice(inv.id); bump(); onToast('Invoice deleted'); } }}><Trash2 size={15} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={!!historyFor} onClose={() => setHistoryFor(null)} title={`History — ${historyFor?.number || ''}`} width={540}>
        {historyFor && (
          historyFor.versions.length === 0 ? (
            <div className="empty-state">
              <Clock size={26} />
              <p>No versions yet. Each time you hit <strong>Save</strong>, a snapshot is kept here for 12 versions.</p>
            </div>
          ) : (
            <ul className="version-list">
              {historyFor.versions.map((v, i) => (
                <li key={v.at + i}>
                  <div>
                    <strong>{fmtDate(v.at.slice(0, 10))} · {v.at.slice(11, 19)}</strong>
                    <span>{v.data.client?.name || 'Untitled'} — {money(computeTotals(v.data).total, v.data.currency)}</span>
                  </div>
                  <button className="btn btn-soft btn-sm" onClick={() => { restoreVersion(historyFor, v); setHistoryFor(null); }}>
                    <Check size={13} /> Restore
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
      </Modal>
    </div>
  );
}
