import { useState } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, Landmark, Loader2, Lock, ReceiptText } from 'lucide-react';
import InvoicePreview from '../components/InvoicePreview';
import { getInvoice, saveInvoice, getSettings } from '../lib/store';
import { computeTotals, paidAmount, computeStatus, STATUS_META, uid, today } from '../lib/invoice';
import { money, fmtDate } from '../lib/format';

const METHODS = [
  { id: 'card', name: 'Card — Stripe', icon: CreditCard },
  { id: 'paypal', name: 'PayPal', icon: Lock },
  { id: 'bank', name: 'Bank transfer', icon: Landmark },
];

export default function PublicInvoice({ id, navigate }) {
  const settings = getSettings();
  const [invoice, setInvoice] = useState(() => getInvoice(id));
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!invoice) {
    return (
      <div className="public-missing">
        <img src="/logo.svg" alt="" width="40" height="40" />
        <h2>Invoice not found</h2>
        <p>This link doesn’t match anything on this device. Ask the sender to share it again.</p>
        <button className="btn btn-primary" onClick={() => (location.hash = '#/')}>Back to InvoiceFlow</button>
      </div>
    );
  }

  const { total } = computeTotals(invoice);
  const paid = paidAmount(invoice);
  const balance = Math.max(total - paid, 0);
  const status = computeStatus(invoice);
  const isPaid = status === 'paid';

  const pay = () => {
    setError('');
    if (balance <= 0) return;
    setProcessing(true);
    setTimeout(() => {
      const updated = saveInvoice({
        ...invoice,
        payments: [...(invoice.payments || []), { id: uid(), amount: balance, date: today(), note: `Online payment (${method})` }],
      });
      setInvoice(updated);
      setProcessing(false);
      setDone(true);
    }, 1500);
  };

  return (
    <div className="public-page">
      <div className="public-top">
        <button className="btn btn-ghost btn-sm" onClick={() => (location.hash = '#/')}>
          <ArrowLeft size={14} /> InvoiceFlow
        </button>
        <div className="public-top-right">
          <span className={`status-pill ${STATUS_META[status].cls}`}>{STATUS_META[status].label}</span>
          <span className="public-view-chip"><Lock size={11} /> Client view</span>
        </div>
      </div>

      <div className="public-grid">
        <div className="public-sheet">
          <InvoicePreview invoice={invoice} settings={settings} />
        </div>

        <aside className="public-pay">
          {isPaid ? (
            <div className="gateway done">
              <div className="gateway-ok"><CheckCircle2 size={30} /></div>
              <h3>Thank you — fully paid!</h3>
              <p>This invoice has been settled in full. A receipt was emailed to {invoice.client?.email || 'you'}.</p>
              <div className="gateway-receipt">
                <span>{invoice.number}</span>
                <strong>{money(paid, invoice.currency)}</strong>
              </div>
            </div>
          ) : done ? (
            <div className="gateway done">
              <div className="gateway-ok"><CheckCircle2 size={30} /></div>
              <h3>Payment received!</h3>
              <p>{money(balance, invoice.currency)} has been applied to {invoice.number}. Thank you!</p>
            </div>
          ) : (
            <div className="gateway">
              <h3>Pay {invoice.client?.name || 'this invoice'}</h3>
              <div className="gateway-total">
                <span>Balance due</span>
                <strong>{money(balance, invoice.currency)}</strong>
              </div>
              <div className="gateway-paid-line">
                <span>Total {money(total, invoice.currency)}</span>
                <span>{money(paid, invoice.currency)} paid</span>
              </div>

              <label className="field">
                <span className="field-label">Payment method</span>
                <div className="method-list">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`method ${method === m.id ? 'active' : ''}`}
                      onClick={() => setMethod(m.id)}
                    >
                      <m.icon size={16} /> {m.name}
                    </button>
                  ))}
                </div>
              </label>

              {error && <p className="form-error">{error}</p>}
              <button className="btn btn-primary btn-block btn-lg" onClick={pay} disabled={processing}>
                {processing ? <><Loader2 size={17} className="spin" /> Processing…</> : <><Lock size={15} /> Pay {money(balance, invoice.currency)}</>}
              </button>
              <p className="modal-note">Demo gateway — no real money moves. In production this connects to Stripe / PayPal.</p>
            </div>
          )}

          <div className="public-receipt-card">
            <ReceiptText size={15} />
            <div>
              <strong>{invoice.number || 'Unnumbered'}</strong>
              <span>Issued {fmtDate(invoice.meta.issueDate)} · Due {fmtDate(invoice.meta.dueDate)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
