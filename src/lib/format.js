export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD — US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'EUR — Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'GBP — British Pound', locale: 'en-GB' },
  { code: 'NGN', symbol: '₦', label: 'NGN — Nigerian Naira', locale: 'en-NG' },
  { code: 'GHS', symbol: 'GH₵', label: 'GHS — Ghanaian Cedi', locale: 'en-GH' },
  { code: 'KES', symbol: 'KSh', label: 'KES — Kenyan Shilling', locale: 'en-KE' },
  { code: 'ZAR', symbol: 'R', label: 'ZAR — South African Rand', locale: 'en-ZA' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD — Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', label: 'AUD — Australian Dollar', locale: 'en-AU' },
];

export function money(value, code = 'USD') {
  const c = CURRENCIES.find((x) => x.code === code) || CURRENCIES[0];
  const n = Number(value) || 0;
  try {
    return new Intl.NumberFormat(c.locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${c.symbol}${n.toFixed(2)}`;
  }
}

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function inDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
