import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Plus, Trash2, Printer, Save, Share2, FileText, Download, Link2, Send,
  RefreshCw, CheckCircle2, Briefcase,
} from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import Modal from './Modal';
import Onboarding from './Onboarding';
import {
  sampleInvoice, ITEM_KINDS, computeTotals, computeStatus, STATUS_META, uid, today,
} from '../lib/invoice';
import { TEMPLATES } from '../lib/templates';
import { CURRENCIES, money } from '../lib/format';
import { LANGUAGES } from '../lib/i18n';
import { convert } from '../lib/rates';
import { load, save, KEYS } from '../lib/storage';
import {
  getSettings, getClients, getInvoice, saveInvoice, pushVersion, peekNumber, nextNumber,
} from '../lib/store';

const Field = ({ label, value, onChange, placeholder, type = 'text', area, rows = 3 }) => (
  <label className="field">
    <span className="field-label">{label}</span>
    {area ? (
      <textarea className="input" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <input className="input" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    )}
  </label>
);

const kindLabel = (kind) => {
  if (kind === 'hours') return 'Hours';
  if (kind === 'fixed') return 'Fee';
  return 'Qty';
};

export default function Builder({ mode, invoiceId, clientId, onBack, onToast, navigate }) {
  const settings = getSettings();
  const [invoice, setInvoice] = useState(() => {
    if (mode === 'edit' && invoiceId) {
      const existing = getInvoice(invoiceId);
      if (existing) return existing;
    }
    const draft = load(KEYS.draft);
    const base = draft && draft.type ? draft : sampleInvoice(settings);
    if (clientId) {
      const client = getClients().find((c) => c.id === clientId);
      if (client) {
        return {
          ...base,
          clientId: client.id,
          client: { name: client.name, email: client.email || '', address: client.address || '' },
        };
      }
    }
    return base;
  });
  const [converted, setConverted] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    mode === 'new' && !load(KEYS.onboarding)
  );

  const isNew = mode === 'new' || !invoice.number;
  const isEstimate = invoice.type === 'estimate';
  const { subtotal, discountAmount, tax, total } = computeTotals(invoice);
  const status = computeStatus(invoice);

  /* autosave draft (new invoices only) */
  useEffect(() => {
    if (!isNew) return;
    const t = setTimeout(() => save(KEYS.draft, invoice), 500);
    return () => clearTimeout(t);
  }, [invoice, isNew]);

  /* live conversion to secondary currency */
  useEffect(() => {
    let alive = true;
    const { secondaryCurrency } = getSettings();
    if (!secondaryCurrency || secondaryCurrency === invoice.currency) {
      setConverted(null);
      return;
    }
    convert(total, invoice.currency, secondaryCurrency).then(({ value }) => {
      if (alive) setConverted({ label: secondaryCurrency, value: money(value, secondaryCurrency) });
    });
    return () => { alive = false; };
  }, [total, invoice.currency]);

  /* keyboard shortcuts: Cmd/Ctrl+S save, Cmd/Ctrl+P print */
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === 's') { e.preventDefault(); doSave(); }
      if (e.key === 'p') { e.preventDefault(); window.print(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const patch = (fn) => setInvoice((prev) => fn(prev));
  const setBusiness = (k, v) => patch((p) => ({ ...p, business: { ...p.business, [k]: v } }));
  const setClientField = (k, v) => patch((p) => ({ ...p, client: { ...p.client, [k]: v } }));
  const setMeta = (k, v) => patch((p) => ({ ...p, meta: { ...p.meta, [k]: v } }));
  const setItem = (id, k, v) =>
    patch((p) => ({ ...p, items: p.items.map((it) => (it.id === id ? { ...it, [k]: v } : it)) }));
  const addItem = () =>
    patch((p) => ({ ...p, items: [...p.items, { id: uid(), kind: 'qty', description: '', qty: 1, rate: 0 }] }));
  const removeItem = (id) => patch((p) => ({ ...p, items: p.items.length > 1 ? p.items.filter((it) => it.id !== id) : p.items }));
  const chooseTemplate = (id) => patch((p) => ({ ...p, template: id }));

  const setDiscount = (v) =>
    patch((p) => ({ ...p, discount: { type: 'percent', value: v } }));
  const setTaxRate = (v) =>
    patch((p) => ({ ...p, taxRate: v, taxRegion: 'none' })); // neutral “Tax” label on the invoice

  const doSave = () => {
    const needsNumber = !invoice.number;
    const number = invoice.number || peekNumber(invoice.type);
    if (needsNumber) nextNumber(invoice.type);
    const doc = pushVersion({ ...invoice, number });
    saveInvoice(doc);
    setInvoice(doc);
    save(KEYS.draft, null);
    onToast(`${doc.type === 'estimate' ? 'Estimate' : 'Invoice'} ${number} saved`);
  };

  const convertToInvoice = () => {
    patch((p) => ({ ...p, type: 'invoice', number: '', meta: { ...p.meta, dueDate: today() } }));
    onToast('Estimate converted — a fresh invoice number is assigned on save');
  };

  const publicLink = useMemo(() => `${location.origin}${location.pathname}#/i/${invoice.id}`, [invoice.id]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      onToast('Link copied — share it with your client');
    } catch {
      onToast(publicLink);
    }
  };

  const emailClient = () => {
    const subject = encodeURIComponent(`${isEstimate ? 'Estimate' : 'Invoice'} ${invoice.number} from ${invoice.business.name || 'your business'}`);
    const body = encodeURIComponent(
      `Hi ${invoice.client.name || 'there'},\n\nPlease find your ${isEstimate ? 'estimate' : 'invoice'} here:\n${publicLink}\n\nTotal: ${money(total, invoice.currency)}\n\nThanks!`
    );
    patch((p) => ({ ...p, sentAt: p.sentAt || new Date().toISOString() }));
    onToast('Marked as sent');
    window.location.href = `mailto:${invoice.client.email || ''}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="builder">
      <div className="builder-toolbar">
        <div className="toolbar-inner">
          <button className="icon-btn" onClick={onBack} aria-label="Back to invoices" title="Back to invoices">
            <ArrowLeft size={18} />
          </button>

          <div className="toolbar-title">
            <strong>{isEstimate ? 'Estimate builder' : 'Invoice builder'}</strong>
            <span className="toolbar-sub">{invoice.number || peekNumber(invoice.type)}</span>
          </div>

          <span className={`status-pill ${STATUS_META[status].cls}`}>{STATUS_META[status].label}</span>

          <div className="toolbar-currency">
            <select className="input input-sm" value={invoice.currency} onChange={(e) => patch((p) => ({ ...p, currency: e.target.value }))}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>
          <select className="input input-sm" value={invoice.language} onChange={(e) => patch((p) => ({ ...p, language: e.target.value }))}>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>

          <div className="toolbar-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setShowShare(true)}>
              <Share2 size={15} /> Share
            </button>
            <button className="btn btn-ghost btn-sm" onClick={doSave}>
              <Save size={15} /> Save <span className="kbd">⌘S</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
              <Printer size={15} /> PDF <span className="kbd">⌘P</span>
            </button>
          </div>
        </div>
      </div>

      <div className="builder-body">
        <aside className="builder-form">
          {showOnboarding && <Onboarding onDismiss={() => { setShowOnboarding(false); save(KEYS.onboarding, true); }} />}

          <section className="form-section">
            <h3>Document type</h3>
            <div className="type-toggle">
              <button className={!isEstimate ? 'active' : ''} onClick={() => patch((p) => ({ ...p, type: 'invoice' }))}>
                <FileText size={15} /> Invoice
              </button>
              <button className={isEstimate ? 'active' : ''} onClick={() => patch((p) => ({ ...p, type: 'estimate' }))}>
                <Briefcase size={15} /> Estimate
              </button>
            </div>
            {isEstimate && (
              <button className="btn btn-soft btn-sm btn-block convert-btn" onClick={convertToInvoice}>
                <RefreshCw size={14} /> Convert to invoice in one click
              </button>
            )}
          </section>

          <section className="form-section">
            <h3>Your business</h3>
            <Field label="Business name" value={invoice.business.name} onChange={(v) => setBusiness('name', v)} placeholder="Adeola Creative Studio" />
            <Field label="Email" value={invoice.business.email} onChange={(v) => setBusiness('email', v)} placeholder="hello@studio.com" />
            <Field label="Phone" value={invoice.business.phone} onChange={(v) => setBusiness('phone', v)} placeholder="+1 (555) 000-0000" />
            <Field label="Address" value={invoice.business.address} onChange={(v) => setBusiness('address', v)} placeholder="Street, City, Country" />
            <label className="field">
              <span className="field-label">Logo (optional)</span>
              <div className="logo-upload">
                {invoice.business.logo ? (
                  <>
                    <img src={invoice.business.logo} alt="Logo" className="logo-preview" />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setBusiness('logo', '')}>Remove</button>
                  </>
                ) : (
                  <>
                    <input type="file" accept="image/*" id="logo-file" className="sr-only" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const r = new FileReader();
                      r.onload = () => setBusiness('logo', String(r.result));
                      r.readAsDataURL(f);
                    }} />
                    <label htmlFor="logo-file" className="btn btn-soft btn-sm"><Download size={14} /> Upload</label>
                  </>
                )}
              </div>
            </label>
          </section>

          <section className="form-section">
            <h3>Client</h3>
            <Field label="Client name" value={invoice.client.name} onChange={(v) => setClientField('name', v)} placeholder="Summit Coffee Co." />
            <Field label="Client email" value={invoice.client.email} onChange={(v) => setClientField('email', v)} placeholder="finance@client.com" />
            <Field label="Client address" area rows={2} value={invoice.client.address} onChange={(v) => setClientField('address', v)} placeholder={'Street, City\nCountry'} />
          </section>

          <section className="form-section">
            <h3>Details</h3>
            <div className="field-row">
              <Field label="Invoice number" value={invoice.number || peekNumber(invoice.type)} onChange={(v) => patch((p) => ({ ...p, number: v }))} />
              <div className="field">
                <span className="field-label">Issue date</span>
                <input className="input" type="date" value={invoice.meta.issueDate} onChange={(e) => setMeta('issueDate', e.target.value)} />
              </div>
            </div>
            <Field label="Due date" type="date" value={invoice.meta.dueDate} onChange={(v) => setMeta('dueDate', v)} />
          </section>

          <section className="form-section">
            <div className="section-head-row">
              <h3>Line items</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
                <Plus size={15} /> Add item
              </button>
            </div>
            <div className="items-editor">
              {invoice.items.map((it) => (
                <div className="item-card" key={it.id}>
                  <div className="item-row">
                    <Field label="Description" value={it.description} onChange={(v) => setItem(it.id, 'description', v)} placeholder="Service or product" />
                    <label className="field">
                      <span className="field-label">Type</span>
                      <select className="input" value={it.kind} onChange={(e) => setItem(it.id, 'kind', e.target.value)}>
                        {ITEM_KINDS.map((k) => <option key={k.code} value={k.code}>{k.name}</option>)}
                      </select>
                    </label>
                    {it.kind !== 'fixed' && (
                      <Field
                        label={kindLabel(it.kind)}
                        type="number"
                        value={it.qty}
                        onChange={(v) => setItem(it.id, 'qty', v)}
                        placeholder="1"
                      />
                    )}
                    <Field label={it.kind === 'hours' ? 'Hourly rate' : 'Rate'} type="number" value={it.rate} onChange={(v) => setItem(it.id, 'rate', v)} placeholder="0" />
                    <button type="button" className="item-remove" onClick={() => removeItem(it.id)} aria-label="Remove item">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="item-line-total">
                    <span>
                      {it.kind === 'fixed'
                        ? 'Flat rate'
                        : `${it.qty || 0} × ${money(it.rate || 0, invoice.currency)}`}
                    </span>
                    <strong>{money(
                      it.kind === 'fixed' ? Number(it.rate) || 0 : (Number(it.qty) || 0) * (Number(it.rate) || 0),
                      invoice.currency
                    )}</strong>
                  </div>
                </div>
              ))}
            </div>
            <div className="items-total">
              <span>Subtotal</span>
              <strong>{money(subtotal, invoice.currency)}</strong>
            </div>
          </section>

          <section className="form-section">
            <h3>Discount & tax</h3>
            <div className="field-row">
              <Field label="Discount (%)" type="number" value={invoice.discount.value} onChange={setDiscount} placeholder="0" />
              <Field label="Tax (%)" type="number" value={invoice.taxRate} onChange={setTaxRate} placeholder="7.5" />
            </div>
            {(discountAmount > 0 || tax > 0) && (
              <p className="field-hint">
                {discountAmount > 0 && `Discount ${discountAmount > 0 ? `−${money(discountAmount, invoice.currency)}` : ''}`}
                {discountAmount > 0 && tax > 0 && ' · '}
                {tax > 0 && `Tax ${money(tax, invoice.currency)}`}
                {' '}— included in the total.
              </p>
            )}
          </section>

          <section className="form-section">
            <h3>Notes & terms</h3>
            <Field label="Notes (optional)" area rows={2} value={invoice.notes} onChange={(v) => patch((p) => ({ ...p, notes: v }))} placeholder="Thanks for your business!" />
            <Field label="Payment terms (optional)" area rows={2} value={invoice.terms} onChange={(v) => patch((p) => ({ ...p, terms: v }))} placeholder="Payment due within 14 days." />
          </section>
        </aside>

        <main className="builder-preview">
          <div className="template-strip">
            <span className="template-label">Template</span>
            <div className="template-pills">
              {TEMPLATES.map((t) => (
                <button key={t.id} className={`pill ${invoice.template === t.id ? 'active' : ''}`} onClick={() => chooseTemplate(t.id)}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="preview-wrap">
            <InvoicePreview invoice={invoice} settings={settings} convertedTotal={converted} />
          </div>

          <p className="print-hint">
            <FileText size={13} /> Print is pixel-perfect — choose <strong>“Save as PDF”</strong> in the dialog ({settings.paper}).
          </p>
        </main>
      </div>

      <Modal open={showShare} onClose={() => setShowShare(false)} title="Share this invoice" width={520}>
        <div className="share-box">
          <p className="modal-sub">Send a private link — your client can view it without an account and pay online.</p>
          <div className="share-link-row">
            <input className="input" readOnly value={publicLink} onFocus={(e) => e.target.select()} />
            <button className="btn btn-soft btn-sm" onClick={copyLink}><Link2 size={14} /> Copy</button>
          </div>
          <div className="share-actions">
            <button className="btn btn-primary btn-block" onClick={emailClient}>
              <Send size={15} /> Email to {invoice.client.name || 'client'} (marks as sent)
            </button>
          </div>
          <p className="modal-note">Demo note: links are stored on this device, so they work for you locally.</p>
        </div>
      </Modal>
    </div>
  );
}
