import { load, save, remove, KEYS } from './storage';
import { normalizeInvoice, defaultInvoice, rollDate, uid, summarize } from './invoice';

/* ---------- settings ---------- */
export const defaultSettings = () => ({
  prefix: 'INV',
  estimatePrefix: 'EST',
  invoiceCounter: 1,
  estimateCounter: 1,
  paper: 'A4', // A4 | Letter
  theme: 'light', // light | dark
  language: 'en',
  accent: '#4F46E5',
  currency: 'USD',
  secondaryCurrency: 'EUR',
  businessName: '',
  taxRegion: 'none',
  footer: 'Payment due within 14 days. Thank you for your business.',
});

export const getSettings = () => ({ ...defaultSettings(), ...(load(KEYS.settings) || {}) });

export const setSettings = (patch) => {
  const s = { ...getSettings(), ...patch };
  save(KEYS.settings, s);
  return s;
};

export function peekNumber(type) {
  const s = getSettings();
  const counterKey = type === 'estimate' ? 'estimateCounter' : 'invoiceCounter';
  const prefix = type === 'estimate' ? s.estimatePrefix : s.prefix;
  const n = Number(s[counterKey]) || 1;
  return `${prefix}-${String(n).padStart(4, '0')}`;
}

export function nextNumber(type) {
  const n = peekNumber(type);
  const s = getSettings();
  const counterKey = type === 'estimate' ? 'estimateCounter' : 'invoiceCounter';
  setSettings({ [counterKey]: (Number(s[counterKey]) || 1) + 1 });
  return n;
}

/* ---------- invoices ---------- */
export const getInvoices = () => (load(KEYS.invoices) || []).map((i) => normalizeInvoice(i, getSettings()));

export const getInvoice = (id) => getInvoices().find((i) => i.id === id) || null;

export function saveInvoice(doc) {
  const list = getInvoices();
  const next = { ...doc, updatedAt: new Date().toISOString() };
  const rest = list.filter((i) => i.id !== next.id);
  save(KEYS.invoices, [next, ...rest]);
  return next;
}

export const deleteInvoice = (id) => {
  save(KEYS.invoices, getInvoices().filter((i) => i.id !== id));
};

export function pushVersion(doc) {
  const { versions, ...snapshot } = doc;
  const list = [{ at: new Date().toISOString(), data: snapshot }, ...(versions || [])].slice(0, 12);
  return { ...doc, versions: list };
}

export function migrateLegacy() {
  // Import invoices saved by the previous single-builder version.
  const legacy = load(KEYS.saved);
  if (Array.isArray(legacy) && legacy.length && !load(KEYS.invoices)) {
    const imported = legacy.map((s) => normalizeInvoice(s.data, getSettings()));
    save(KEYS.invoices, imported);
  }
  remove(KEYS.saved);
}

/* ---------- recurring ---------- */
export function runRecurring() {
  const s = getSettings();
  const list = getInvoices();
  let generated = 0;
  const next = [];
  for (const doc of list) {
    const r = doc.recurring || {};
    const due = r.enabled && r.nextDate ? new Date(`${r.nextDate}T00:00:00`) : null;
    if (doc.type !== 'invoice' || !due || due > new Date()) {
      next.push(doc);
      continue;
    }
    // create the next occurrence, then roll the source forward
    const copy = normalizeInvoice({ ...doc, id: uid(), payments: [], sentAt: null, versions: [] }, s);
    copy.number = nextNumber('invoice');
    copy.meta = { ...copy.meta, issueDate: r.nextDate, dueDate: rollDate(r.nextDate, r.unit, r.every) };
    const rolledNext = rollDate(r.nextDate, r.unit, r.every);
    copy.recurring = { ...r, nextDate: rolledNext };
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    next.push(copy);
    next.push({ ...doc, recurring: { ...r, nextDate: rolledNext } });
    generated += 1;
  }
  if (generated) save(KEYS.invoices, next);
  return generated;
}

/* ---------- clients ---------- */
export const getClients = () => load(KEYS.clients) || [];

export const getClient = (id) => getClients().find((c) => c.id === id) || null;

export function saveClient(client) {
  const list = getClients();
  const rest = list.filter((c) => c.id !== client.id);
  save(KEYS.clients, [...rest, client]);
  return client;
}

export const deleteClient = (id) => {
  save(KEYS.clients, getClients().filter((c) => c.id !== id));
};

export function clientStats(id) {
  const invoices = getInvoices().filter((i) => i.clientId === id);
  let billed = 0;
  let outstanding = 0;
  let count = 0;
  for (const inv of invoices) {
    const { total, paid, status } = summarize(inv);
    billed += total;
    if (status !== 'estimate') outstanding += Math.max(total - paid, 0);
    count += 1;
  }
  return { count, billed, outstanding };
}

/* ---------- expenses ---------- */
export const getExpenses = () => load(KEYS.expenses) || [];

export function saveExpense(exp) {
  const list = getExpenses();
  const rest = list.filter((e) => e.id !== exp.id);
  save(KEYS.expenses, [...rest, exp]);
  return exp;
}

export const deleteExpense = (id) => {
  save(KEYS.expenses, getExpenses().filter((e) => e.id !== id));
};

export function expenseTotal() {
  return getExpenses().reduce((s, e) => s + (Number(e.amount) || 0), 0);
}

/* ---------- export / import / reset ---------- */
export function exportAll() {
  return JSON.stringify(
    {
      app: 'InvoiceFlow',
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: getSettings(),
      invoices: getInvoices(),
      clients: getClients(),
      expenses: getExpenses(),
    },
    null,
    2
  );
}

export function importAll(json) {
  const data = JSON.parse(json);
  if (!data || typeof data !== 'object') throw new Error('Invalid backup file');
  if (data.settings) save(KEYS.settings, data.settings);
  if (Array.isArray(data.invoices)) save(KEYS.invoices, data.invoices);
  if (Array.isArray(data.clients)) save(KEYS.clients, data.clients);
  if (Array.isArray(data.expenses)) save(KEYS.expenses, data.expenses);
}

export function resetAll() {
  [KEYS.invoices, KEYS.clients, KEYS.expenses, KEYS.settings, KEYS.draft, KEYS.onboarding].forEach((k) => remove(k));
}
