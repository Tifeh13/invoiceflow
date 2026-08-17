import { useState } from 'react';
import { Plus, Trash2, Users, Pencil, FileText } from 'lucide-react';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { getClients, saveClient, deleteClient, clientStats, getInvoices } from '../lib/store';
import { uid, computeTotals } from '../lib/invoice';
import { money } from '../lib/format';

const blank = () => ({ id: uid(), name: '', email: '', phone: '', address: '', taxId: '', notes: '' });

export default function Clients({ navigate, onToast, currency }) {
  const [clients, setClients] = useState(getClients());
  const [editing, setEditing] = useState(null); // client object or 'new'
  const [form, setForm] = useState(blank());

  const openNew = () => { setForm(blank()); setEditing('new'); };
  const openEdit = (c) => { setForm({ ...c }); setEditing(c.id); };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return onToast('Client needs a name');
    const c = saveClient({ ...form, name: form.name.trim() });
    setClients(getClients());
    setEditing(null);
    onToast(`Saved client “${c.name}”`);
  };

  const remove = (c) => {
    if (window.confirm(`Delete ${c.name}? Their invoices stay in your library.`)) {
      deleteClient(c.id);
      setClients(getClients());
      onToast('Client deleted');
    }
  };

  const invoices = getInvoices();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Clients</h1>
          <p>{clients.length} {clients.length === 1 ? 'client' : 'clients'} — with billing history and notes.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> New client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No clients yet"
            desc="Save clients once, then reuse them across invoices — with their billing history and notes attached."
            action={<button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={14} /> Add your first client</button>}
          />
        </div>
      ) : (
        <div className="client-grid">
          {clients.map((c) => {
            const stats = clientStats(c.id);
            const history = invoices.filter((i) => i.clientId === c.id);
            return (
              <div className="client-card" key={c.id}>
                <div className="client-head">
                  <div className="client-avatar">{c.name.slice(0, 1).toUpperCase()}</div>
                  <div className="client-id">
                    <strong>{c.name}</strong>
                    <span>{c.email || c.phone || 'No contact info'}</span>
                  </div>
                  <div className="client-actions">
                    <button className="icon-btn" onClick={() => openEdit(c)} title="Edit"><Pencil size={14} /></button>
                    <button className="icon-btn danger" onClick={() => remove(c)} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>

                {c.notes && <p className="client-notes">{c.notes}</p>}

                <div className="client-stats">
                  <div><span>Invoices</span><strong>{stats.count}</strong></div>
                  <div><span>Billed</span><strong>{money(stats.billed, currency)}</strong></div>
                  <div><span>Outstanding</span><strong className={stats.outstanding > 0 ? 'warn' : ''}>{money(stats.outstanding, currency)}</strong></div>
                </div>

                <div className="client-foot">
                  <span className="client-history">
                    {history.length > 0 ? `Latest: ${history[0].number || '—'} (${money(computeTotals(history[0]).total, history[0].currency)})` : 'No invoices yet'}
                  </span>
                  <button className="btn btn-soft btn-sm" onClick={() => {
                    const link = `#/app/invoices/new?client=${c.id}`;
                    navigate(link);
                  }}>
                    <FileText size={13} /> New invoice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New client' : 'Edit client'}>
        <form onSubmit={submit}>
          <div className="field"><span className="field-label">Name *</span><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summit Coffee Co." /></div>
          <div className="field-row">
            <div className="field"><span className="field-label">Email</span><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="finance@client.com" /></div>
            <div className="field"><span className="field-label">Phone</span><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" /></div>
          </div>
          <div className="field"><span className="field-label">Address</span><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, Country" /></div>
          <div className="field"><span className="field-label">Tax ID (optional)</span><input className="input" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} placeholder="VAT-0000-0000" /></div>
          <div className="field"><span className="field-label">Notes</span><textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Payment preferences, contacts, anything useful…" /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" type="submit">Save client</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


