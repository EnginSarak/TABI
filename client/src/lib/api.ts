import type { ForeignCurrency } from "./currencies";

interface ExchangeRateResponse {
  rate: number;
  timestamp: string;
  prevRate?: number;
}

interface CachedExchangeRate {
  rate: number;
  timestamp: string;
  cachedAt: number;
}

function cacheKey(currency: ForeignCurrency): string {
  return `tabi-rate-cache-${currency}`;
}

function prevKey(currency: ForeignCurrency): string {
  return `tabi-rate-prev-${currency}`;
}

export function getCachedRate(currency: ForeignCurrency): ExchangeRateResponse | null {
  try {
    const cached = localStorage.getItem(cacheKey(currency));
    if (!cached) return null;
    const data: CachedExchangeRate = JSON.parse(cached);
    const prev = localStorage.getItem(prevKey(currency));
    const prevRate = prev ? (JSON.parse(prev) as { rate: number }).rate : undefined;
    return { rate: data.rate, timestamp: data.timestamp, prevRate };
  } catch {
    return null;
  }
}

function saveCachedRate(currency: ForeignCurrency, rate: number, timestamp: string): void {
  try {
    const ck = cacheKey(currency);
    const pk = prevKey(currency);
    const existing = localStorage.getItem(ck);
    if (existing) {
      const old: CachedExchangeRate = JSON.parse(existing);
      if (old.timestamp !== timestamp) {
        localStorage.setItem(pk, JSON.stringify({ rate: old.rate, timestamp: old.timestamp }));
      }
    }
    localStorage.setItem(ck, JSON.stringify({ rate, timestamp, cachedAt: Date.now() }));
  } catch {}
}

export async function fetchExchangeRate(currency: ForeignCurrency): Promise<ExchangeRateResponse | null> {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/EUR");
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.rates || !data.rates[currency]) return null;
    const timestamp = new Date(data.time_last_update_unix * 1000).toLocaleDateString("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    const prev = localStorage.getItem(prevKey(currency));
    const prevRate = prev ? (JSON.parse(prev) as { rate: number }).rate : undefined;
    const result: ExchangeRateResponse = { rate: data.rates[currency], timestamp, prevRate };
    saveCachedRate(currency, result.rate, result.timestamp);
    return result;
  } catch {
    return null;
  }
}
