export const KEYS = {
  draft: 'invoiceflow:draft',
  plan: 'invoiceflow:plan',
  saved: 'invoiceflow:saved', // legacy — migrated into `invoices`
  invoices: 'invoiceflow:invoices',
  clients: 'invoiceflow:clients',
  expenses: 'invoiceflow:expenses',
  settings: 'invoiceflow:settings',
  onboarding: 'invoiceflow:onboarding',
};

export function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
