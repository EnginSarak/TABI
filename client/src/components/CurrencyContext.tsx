import * as React from "react";
import { createContext, useContext } from "react";
import type { ForeignCurrency, CurrencyConfig } from "../lib/currencies";
import { CURRENCIES } from "../lib/currencies";

interface CurrencyContextType {
  currency: ForeignCurrency;
  config: CurrencyConfig;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({
  currency,
  children,
}: {
  currency: ForeignCurrency;
  children: React.ReactNode;
}) {
  const config = CURRENCIES[currency];
  return (
    <CurrencyContext.Provider value={{ currency, config }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
