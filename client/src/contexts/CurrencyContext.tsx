import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { ForeignCurrency, CurrencyConfig } from "../lib/currencies";
import { CURRENCIES } from "../lib/currencies";

interface CurrencyContextType {
  currency: ForeignCurrency;
  config: CurrencyConfig;
  setCurrency: (c: ForeignCurrency) => void;
  hasChosen: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<ForeignCurrency>(() => {
    const saved = localStorage.getItem("tabi-currency") as ForeignCurrency;
    return saved && CURRENCIES[saved] ? saved : "JPY";
  });

  const [hasChosen, setHasChosen] = useState(() => !!localStorage.getItem("tabi-currency"));

  function applyTheme(c: ForeignCurrency) {
    const primary = CURRENCIES[c].theme.primary;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", primary);
    document.documentElement.style.backgroundColor = "#000";
    document.body.style.backgroundColor = "#000";
  }

  useEffect(() => {
    if (hasChosen) applyTheme(currency);
  }, []);

  function setCurrency(c: ForeignCurrency) {
    setCurrencyState(c);
    localStorage.setItem("tabi-currency", c);
    setHasChosen(true);
    applyTheme(c);
  }

  return (
    <CurrencyContext.Provider value={{ currency, config: CURRENCIES[currency], setCurrency, hasChosen }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
