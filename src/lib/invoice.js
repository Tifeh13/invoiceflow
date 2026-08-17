export const uid = () => Math.random().toString(36).slice(2, 10);

export const today = () => new Date().toISOString().slice(0, 10);

export function inDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const ITEM_KINDS = [
  { code: 'qty', name: 'Per item', qtyLabel: 'Qty' },
  { code: 'hours', name: 'Time-based', qtyLabel: 'Hours' },
  { code: 'fixed', name: 'Flat rate', qtyLabel: '' },
];

export const itemAmount = (it) => {
  const qty = Number(it.qty) || 0;
  const rate = Number(it.rate) || 0;
  if (it.kind === 'fixed') return rate;
  return qty * rate;
};

export function defaultInvoice(settings = {}) {
  return {
    id: uid(),
    type: 'invoice',
    number: '',
    currency: settings.currency || 'USD',
    template: 'modern',
    language: settings.language || 'en',
    business: {
      name: settings.businessName || '',
      email: '', phone: '', address: '', taxId: '', logo: '',
    },
    clientId: null,
    client: { name: '', email: '', address: '' },
    meta: { issueDate: today(), dueDate: inDays(14), poNumber: '' },
    items: [{ id: uid(), kind: 'qty', description: '', qty: 1, rate: 0 }],
    discount: { type: 'percent', value: 0 },
    taxRegion: settings.taxRegion || 'none',
    taxRate: getRate(settings.taxRegion),
    notes: '',
    terms: settings.footer || 'Payment due within 14 days. Thank you for your business.',
    payments: [],
    sentAt: null,
    recurring: { enabled: false, unit: 'month', every: 1, nextDate: '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [],
  };
}

export function sampleInvoice(settings = {}) {
  const inv = defaultInvoice(settings);
  inv.business = {
    name: settings.businessName || 'Adeola Creative Studio',
    email: 'hello@adeolastudio.com',
    phone: '+1 (555) 010-2030',
    address: '14 Marina View, Lagos',
    taxId: 'VAT-4821-0093',
    logo: '',
  };
  inv.client = {
    name: 'Summit Coffee Co.',
    email: 'finance@summitcoffee.com',
    address: '88 Harbourside Way, Suite 4\nPortland, OR 97201',
  };
  inv.meta = { issueDate: today(), dueDate: inDays(14), poNumber: 'PO-2214' };
  inv.items = [
    { id: uid(), kind: 'hours', description: 'Brand identity design — logo suite & guidelines', qty: 12, rate: 70 },
    { id: uid(), kind: 'fixed', description: 'Website design — 5-page marketing site', qty: 1, rate: 1200 },
    { id: uid(), kind: 'qty', description: 'Social media launch kit — 12 assets', qty: 12, rate: 37.5 },
  ];
  inv.taxRegion = 'none';
  inv.taxRate = 7.5;
  inv.notes = 'Revisions included. Thank you for choosing Adeola Creative Studio!';
  return inv;
}

export function computeTotals(invoice) {
  const subtotal = (invoice.items || []).reduce((s, it) => s + itemAmount(it), 0);
  const dVal = Number(invoice.discount?.value) || 0;
  const discountAmount =
    invoice.discount?.type === 'percent'
      ? (subtotal * dVal) / 100
      : Math.min(dVal, subtotal);
  const afterDiscount = Math.max(subtotal - discountAmount, 0);
  const tax = (afterDiscount * (Number(invoice.taxRate) || 0)) / 100;
  return { subtotal, discountAmount, tax, total: afterDiscount + tax };
}

export const paidAmount = (invoice) =>
  (invoice.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);

export function computeStatus(invoice) {
  if (invoice.type === 'estimate') return 'estimate';
  const { total } = computeTotals(invoice);
  const paid = paidAmount(invoice);
  if (total > 0 && paid >= total - 0.005) return 'paid';
  if (paid > 0) return 'partial';
  if (invoice.sentAt) {
    const due = new Date(`${invoice.meta.dueDate || '2999-01-01'}T00:00:00`);
    if (!Number.isNaN(due.getTime()) && due < new Date()) return 'overdue';
    return 'sent';
  }
  return 'draft';
}

export const STATUS_META = {
  draft: { label: 'Draft', cls: 'draft' },
  sent: { label: 'Sent', cls: 'sent' },
  partial: { label: 'Partially paid', cls: 'partial' },
  paid: { label: 'Paid', cls: 'paid' },
  overdue: { label: 'Overdue', cls: 'overdue' },
  estimate: { label: 'Estimate', cls: 'estimate' },
};

export function summarize(invoice) {
  const { total } = computeTotals(invoice);
  return {
    total,
    paid: paidAmount(invoice),
    status: computeStatus(invoice),
    client: invoice.client?.name || 'Untitled client',
    date: invoice.meta?.issueDate,
  };
}

export function getRate(code) {
  const REGIONS = [
    { code: 'none', rate: 0 }, { code: 'NG', rate: 7.5 }, { code: 'UK', rate: 20 },
    { code: 'EU', rate: 21 }, { code: 'GH', rate: 15 }, { code: 'KE', rate: 16 },
    { code: 'ZA', rate: 15 }, { code: 'US', rate: 0 }, { code: 'CA', rate: 13 },
    { code: 'AU', rate: 10 }, { code: 'IN', rate: 18 },
  ];
  return (REGIONS.find((r) => r.code === code) || REGIONS[0]).rate;
}

export function rollDate(iso, unit, every) {
  const d = new Date(`${iso || today()}T00:00:00`);
  if (unit === 'day') d.setDate(d.getDate() + every);
  else if (unit === 'week') d.setDate(d.getDate() + every * 7);
  else if (unit === 'month') d.setMonth(d.getMonth() + every);
  else if (unit === 'year') d.setFullYear(d.getFullYear() + every);
  return d.toISOString().slice(0, 10);
}

/* Merge old / partial shapes with defaults so data written by earlier versions still works. */
export function normalizeInvoice(raw, settings = {}) {
  const base = defaultInvoice(settings);
  if (!raw) return base;
  const d = { ...base, ...raw };
  d.business = { ...base.business, ...(raw.business || {}) };
  d.client = { ...base.client, ...(raw.client || {}) };
  d.meta = { ...base.meta, ...(raw.meta || {}) };
  d.discount = { ...base.discount, ...(raw.discount || {}) };
  d.recurring = { ...base.recurring, ...(raw.recurring || {}) };
  d.items = Array.isArray(raw.items) && raw.items.length
    ? raw.items.map((it) => ({ ...{ id: uid(), kind: 'qty', description: '', qty: 1, rate: 0 }, ...it }))
    : base.items;
  d.payments = Array.isArray(raw.payments) ? raw.payments : [];
  d.versions = Array.isArray(raw.versions) ? raw.versions : [];
  d.createdAt = raw.createdAt || d.createdAt;
  d.updatedAt = raw.updatedAt || d.updatedAt;
  return d;
}
