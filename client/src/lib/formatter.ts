import type { ForeignCurrency } from "./currencies";
import { CURRENCIES } from "./currencies";

export function formatCurrency(amount: number, currency: "EUR" | ForeignCurrency): string {
  if (currency === "EUR") {
    const formatted = amount.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${formatted} €`;
  }
  const config = CURRENCIES[currency];
  const formatted = amount.toLocaleString("de-DE", {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });
  return `${formatted} ${config.symbol}`;
}

export function formatRate(rate: number): string {
  return rate.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
