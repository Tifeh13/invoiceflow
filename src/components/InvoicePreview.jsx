import { computeTotals, computeStatus, itemAmount } from '../lib/invoice';
import { money, fmtDate } from '../lib/format';
import { getTemplate } from '../lib/templates';
import { getTaxRegion } from '../lib/tax';
import { t } from '../lib/i18n';

export default function InvoicePreview({ invoice, settings = {}, convertedTotal }) {
  const tmpl = getTemplate(invoice.template);
  const lang = invoice.language || 'en';
  const { subtotal, discountAmount, tax, total } = computeTotals(invoice);
  const status = computeStatus(invoice);
  const b = invoice.business || {};
  const c = invoice.client || {};
  const m = invoice.meta || {};
  const cur = invoice.currency || 'USD';
  const paper = settings.paper === 'Letter' ? 'letter' : 'a4';
  const accent = settings.accent || '#4F46E5';
  const region = getTaxRegion(invoice.taxRegion);
  const isEstimate = invoice.type === 'estimate';
  const qtyLabel = (kind) =>
    kind === 'hours' ? t(lang, 'hours') : t(lang, 'qty');

  return (
    <div
      className={`sheet paper-${paper} tmpl-${tmpl.id}`}
      id="print-area"
      style={{ '--accent': accent }}
    >
      {status === 'paid' && <div className="stamp-paid"><span>{t(lang, 'paid')}</span></div>}

      <header className="inv-head">
        <div className="inv-brand">
          {b.logo && <img className="inv-logo" src={b.logo} alt={`${b.name} logo`} />}
          <h1 className="inv-business">{b.name || 'Your Business'}</h1>
          <div className="inv-contact">
            {b.email && <span>{b.email}</span>}
            {b.phone && <span>{b.phone}</span>}
            {b.address && <span>{b.address}</span>}
            {b.taxId && <span>Tax ID: {b.taxId}</span>}
          </div>
        </div>
        <div className="inv-title">
          <span className="inv-kicker">{t(lang, isEstimate ? 'estimate' : 'invoice')}</span>
          <span className="inv-num">{m.number || '—'}</span>
        </div>
      </header>

      <section className="inv-panel">
        <div className="inv-billto">
          <h3>{t(lang, 'billedTo')}</h3>
          <p className="strong">{c.name || 'Client name'}</p>
          {c.email && <p>{c.email}</p>}
          {c.address && <p className="pre">{c.address}</p>}
        </div>
        <dl className="inv-meta">
          <div><dt>{t(lang, isEstimate ? 'estimateNo' : 'invoiceNo')}</dt><dd>{m.number || '—'}</dd></div>
          <div><dt>{t(lang, 'issueDate')}</dt><dd>{fmtDate(m.issueDate)}</dd></div>
          {!isEstimate && <div><dt>{t(lang, 'dueDate')}</dt><dd>{fmtDate(m.dueDate)}</dd></div>}
          {m.poNumber && <div><dt>{t(lang, 'poNumber')}</dt><dd>{m.poNumber}</dd></div>}
        </dl>
      </section>

      <section className="inv-items">
        <table>
          <thead>
            <tr>
              <th>{t(lang, 'description')}</th>
              <th className="c">{qtyLabel(invoice.items?.[0]?.kind)}</th>
              <th className="r">{t(lang, 'rate')}</th>
              <th className="r">{t(lang, 'amount')}</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((it) => (
              <tr key={it.id}>
                <td>{it.description || '—'}</td>
                <td className="c">{it.kind === 'fixed' ? '—' : it.qty}</td>
                <td className="r">{it.kind === 'fixed' ? '—' : money(it.rate, cur)}</td>
                <td className="r">{money(itemAmount(it), cur)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="inv-totals">
        <div className="totals-grid">
          <div className="row"><span>{t(lang, 'subtotal')}</span><span>{money(subtotal, cur)}</span></div>
          {discountAmount > 0 && (
            <div className="row">
              <span>{t(lang, 'discount')}{invoice.discount?.type === 'percent' ? ` (${invoice.discount.value}%)` : ''}</span>
              <span>−{money(discountAmount, cur)}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="row"><span>{region.label} ({invoice.taxRate}%)</span><span>{money(tax, cur)}</span></div>
          )}
          <div className="row total"><span>{t(lang, 'totalDue')}</span><span>{money(total, cur)}</span></div>
          {convertedTotal && (
            <div className="row converted"><span>≈ {convertedTotal.label}</span><span>{convertedTotal.value}</span></div>
          )}
        </div>
      </section>

      {(invoice.notes || invoice.terms) && (
        <section className="inv-notes">
          {invoice.notes && (
            <div className="inv-note">
              <h3>{t(lang, 'notes')}</h3>
              <p>{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div className="inv-note">
              <h3>{t(lang, 'terms')}</h3>
              <p>{invoice.terms}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
