let cachedRates: Record<string, number> | null = null;
let lastFetched = 0;
const CACHE_TTL = 5 * 60 * 1000;

const FALLBACK_RATES: Record<string, number> = {
  ETB: 1,
  USD: 0.00625,
  EUR: 0.005435,
  GBP: 0.004673,
};

async function fetchRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cachedRates && now - lastFetched < CACHE_TTL) return cachedRates;

  try {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/ETB");
    if (!response.ok) return FALLBACK_RATES;
    const data = await response.json();
    cachedRates = data.rates;
    lastFetched = now;
    return cachedRates!;
  } catch {
    return FALLBACK_RATES;
  }
}

export async function convertToETB(amount: number, fromCurrency: string): Promise<number> {
  if (fromCurrency === "ETB") return amount;
  const rates = await fetchRates();
  const rate = rates[fromCurrency];
  if (!rate || rate === 0) return amount;
  return Math.round(amount / rate);
}
