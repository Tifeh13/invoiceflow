const FALLBACK = {
  USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1530, GHS: 15.2,
  KES: 129, ZAR: 18.3, CAD: 1.36, AUD: 1.52,
};
const CACHE_KEY = 'invoiceflow:rates';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function getRates() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { at, rates } = JSON.parse(cached);
      if (Date.now() - at < CACHE_TTL) return { ...FALLBACK, ...rates, source: 'cache' };
    }
  } catch { /* ignore */ }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('rate fetch failed');
    const data = await res.json();
    if (data.result !== 'success') throw new Error('rate result failed');
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rates: data.rates }));
    return { ...FALLBACK, ...data.rates, source: 'live' };
  } catch {
    return { ...FALLBACK, source: 'offline' };
  }
}

export async function convert(amount, from, to) {
  if (!to || from === to || !amount) return { value: amount ?? 0, source: 'none' };
  const rates = await getRates();
  const f = rates[from] || 1;
  const t = rates[to] || 1;
  return { value: (Number(amount) / f) * t, source: rates.source };
}
