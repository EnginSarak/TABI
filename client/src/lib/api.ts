interface RatesCache {
  rates: Record<string, number>;
  timestamp: string;
  cachedAt: number;
}

const CACHE_KEY = "tabi-rates-cache";
const PREV_KEY  = "tabi-rates-prev";

function getCachedRates(): RatesCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as RatesCache) : null;
  } catch { return null; }
}

export function getCachedRate(foreignCurrency = "JPY"): { rate: number; timestamp: string; prevRate?: number } | null {
  const cache = getCachedRates();
  if (!cache || !cache.rates[foreignCurrency]) return null;
  const prev = localStorage.getItem(PREV_KEY);
  const prevRate = prev ? (JSON.parse(prev) as Record<string, number>)[foreignCurrency] : undefined;
  return { rate: cache.rates[foreignCurrency], timestamp: cache.timestamp, prevRate };
}

export async function fetchExchangeRate(foreignCurrency = "JPY"): Promise<{ rate: number; timestamp: string; prevRate?: number } | null> {
  try {
    const resp = await fetch("https://open.er-api.com/v6/latest/EUR");
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data.rates || !data.rates[foreignCurrency]) return null;

    const ts = new Date(data.time_last_update_unix * 1000).toLocaleDateString("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });

    const existing = getCachedRates();
    if (existing && existing.timestamp !== ts) {
      localStorage.setItem(PREV_KEY, JSON.stringify(existing.rates));
    }

    const cache: RatesCache = { rates: data.rates, timestamp: ts, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

    const prev = localStorage.getItem(PREV_KEY);
    const prevRate = prev ? (JSON.parse(prev) as Record<string, number>)[foreignCurrency] : undefined;
    return { rate: data.rates[foreignCurrency], timestamp: ts, prevRate };
  } catch { return null; }
}

export function getRateForCurrency(foreignCurrency: string): number | null {
  const cache = getCachedRates();
  return cache?.rates[foreignCurrency] ?? null;
}
