interface ExchangeRateResponse {
  rate: number;
  timestamp: string;
  prevRate?: number;
}

interface CachedExchangeRate {
  rate: number;
  timestamp: string;
  cachedAt: number;
  prevRate?: number;
}

const CACHE_KEY     = "jpn-exchange-rate-cache";
const PREV_RATE_KEY = "jpn-exchange-rate-prev";

export function getCachedRate(): ExchangeRateResponse | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: CachedExchangeRate = JSON.parse(cached);
    const prev = localStorage.getItem(PREV_RATE_KEY);
    const prevRate = prev ? (JSON.parse(prev) as { rate: number }).rate : undefined;
    return { rate: data.rate, timestamp: data.timestamp, prevRate };
  } catch {
    return null;
  }
}

function saveCachedRate(rate: number, timestamp: string): void {
  try {
    const existing = localStorage.getItem(CACHE_KEY);
    if (existing) {
      const old: CachedExchangeRate = JSON.parse(existing);
      if (old.timestamp !== timestamp) {
        localStorage.setItem(PREV_RATE_KEY, JSON.stringify({ rate: old.rate, timestamp: old.timestamp }));
      }
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, timestamp, cachedAt: Date.now() }));
  } catch {}
}

export async function fetchExchangeRate(): Promise<ExchangeRateResponse | null> {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/EUR");
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.rates || !data.rates.JPY) return null;

    const timestamp = new Date(data.time_last_update_unix * 1000);
    const formattedDate = timestamp.toLocaleDateString("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });

    const prev = localStorage.getItem(PREV_RATE_KEY);
    const prevRate = prev ? (JSON.parse(prev) as { rate: number }).rate : undefined;

    const result = { rate: data.rates.JPY, timestamp: formattedDate, prevRate };
    saveCachedRate(result.rate, result.timestamp);
    return result;
  } catch {
    return null;
  }
}
