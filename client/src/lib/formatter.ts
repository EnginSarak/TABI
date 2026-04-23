export function formatCurrency(amount: number, currency: "EUR" | "JPY"): string {
  const decimals = currency === "JPY" ? 0 : 2;
  
  const formatted = amount.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const symbol = currency === "EUR" ? "€" : "¥";
  return `${formatted} ${symbol}`;
}

export function formatRate(rate: number): string {
  return rate.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
