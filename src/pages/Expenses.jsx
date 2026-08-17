import { useState } from 'react';
import { Plus, Trash2, ReceiptText, Pencil } from 'lucide-react';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { getExpenses, saveExpense, deleteExpense, getClients } from '../lib/store';
import { uid, today } from '../lib/invoice';
import { money, fmtDate } from '../lib/format';

const CATEGORIES = ['Software', 'Travel', 'Office', 'Contractors', 'Marketing', 'Other'];
const blank = () => ({ id: uid(), date: today(), description: '', amount: 0, category: 'Other', clientId: '', notes: '' });

export default function Expenses({ onToast, currency }) {
  const [expenses, setExpenses] = useState(getExpenses());
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank());
  const clients = getClients();

  const refresh = () => setExpenses(getExpenses());

  const openNew = () => { setForm(blank()); setEditing('new'); };
  const openEdit = (e) => { setForm({ ...e }); setEditing(e.id); };

  const submit = (ev) => {
    ev.preventDefault();
    if (!form.description.trim() || !Number(form.amount)) return onToast('Add a description and amount');
    saveExpense({ ...form, description: form.description.trim(), amount: Number(form.amount) || 0 });
    setEditing(null);
    refresh();
    onToast('Expense saved');
  };

  const sorted = [...expenses].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const total = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const thisMonth = expenses
    .filter((e) => (e.date || '').startsWith(today().slice(0, 7)))
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const topCat = [...CATEGORIES].sort(
    (a, b) => catSum(b) - catSum(a)
  )[0];
  function catSum(cat) {
    return expenses.filter((e) => e.category === cat).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Expenses</h1>
          <p>Tied to clients and projects, so you always know your real margin.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Add expense
        </button>
      </div>

      <div className="kpi-grid kpi-3">
        <div className="kpi amber"><div className="kpi-icon"><ReceiptText size={19} /></div><div><span className="kpi-label">Total expenses</span><strong className="kpi-value">{money(total, currency)}</strong></div></div>
        <div className="kpi indigo"><div className="kpi-icon"><ReceiptText size={19} /></div><div><span className="kpi-label">This month</span><strong className="kpi-value">{money(thisMonth, currency)}</strong></div></div>
        <div className="kpi violet"><div className="kpi-icon"><ReceiptText size={19} /></div><div><span className="kpi-label">Top category</span><strong className="kpi-value">{topCat || '—'}</strong></div></div>
      </div>

      {sorted.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ReceiptText}
            title="No expenses yet"
            desc="Track costs per client or project and see them alongside what you earn."
            action={<button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={14} /> Add an expense</button>}
          />
        </div>
      ) : (
        <div className="card">
          <div className="table">
            {sorted.map((e) => (
              <div className="table-row expense-row" key={e.id}>
                <div className="table-main">
                  <strong>{e.description}</strong>
                  <span>{fmtDate(e.date)}{e.clientId ? ` · ${clients.find((c) => c.id === e.clientId)?.name || ''}` : ''}</span>
                </div>
                <span className="cat-chip">{e.category}</span>
                <strong className="table-total expense-amount">−{money(e.amount, currency)}</strong>
                <div className="row-actions">
                  <button className="icon-btn" onClick={() => openEdit(e)} title="Edit"><Pencil size={14} /></button>
                  <button className="icon-btn danger" onClick={() => { deleteExpense(e.id); refresh(); onToast('Expense deleted'); }} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add expense' : 'Edit expense'}>
        <form onSubmit={submit}>
          <div className="field"><span className="field-label">Description *</span><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Design software subscription" /></div>
          <div className="field-row">
            <div className="field"><span className="field-label">Amount *</span><input className="input" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="49" /></div>
            <div className="field"><span className="field-label">Date</span><input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="field-row">
            <div className="field">
              <span className="field-label">Category</span>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <span className="field-label">Client (optional)</span>
              <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                <option value="">—</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><span className="field-label">Notes</span><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" type="submit">Save expense</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
