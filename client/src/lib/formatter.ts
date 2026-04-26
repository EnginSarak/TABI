import type { ForeignCurrency } from "./currencies";
import { CURRENCIES } from "./currencies";

export function formatCurrency(amount: number, currency: "EUR" | ForeignCurrency): string {
  if (currency === "EUR") {
    return amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  }
  const cfg = CURRENCIES[currency as ForeignCurrency];
  if (!cfg) return amount.toString();
  return amount.toLocaleString("de-DE", {
    minimumFractionDigits: cfg.decimals,
    maximumFractionDigits: cfg.decimals,
  }) + " " + cfg.symbol;
}

export function formatRate(rate: number): string {
  return rate.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}
