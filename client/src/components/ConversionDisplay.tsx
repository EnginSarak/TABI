import * as React from "react";
import { useRef, useLayoutEffect } from "react";
import { formatCurrency } from "../lib/formatter";
import type { ForeignCurrency } from "../lib/currencies";
import { useCurrency } from "../contexts/CurrencyContext";
import ChfSymbol from "./ChfSymbol";

function RollingNumber({ formatted }: { formatted: string }) {
  const prevRef = useRef<string>(formatted);
  const prev = prevRef.current;
  useLayoutEffect(() => { prevRef.current = formatted; });

  return (
    <span style={{ display: "inline-flex", alignItems: "baseline" }}>
      {formatted.split("").map((char, i) => {
        const prevChar = prev[i] ?? char;
        const isDigit  = /\d/.test(char);
        const changed  = isDigit && char !== prevChar;
        if (!isDigit) {
          return <span key={i} style={{ display: "inline-block", lineHeight: "1", alignSelf: "flex-end" }}>{char}</span>;
        }
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", height: "1em", lineHeight: "1", verticalAlign: "bottom" }}>
            <span
              key={changed ? `${i}-${char}-${formatted}` : `${i}-${char}`}
              style={{ display: "block", animation: changed ? "rollIn 0.22s cubic-bezier(0.2,0,0,1) both" : "none" }}
            >
              {char}
            </span>
          </span>
        );
      })}
    </span>
  );
}

interface ConversionDisplayProps {
  result:    number;
  currency:  "EUR" | ForeignCurrency;
  isLoading: boolean;
  isDark:    boolean;
  children?: React.ReactNode;
}

function ConversionDisplay({ result, currency, isLoading, children }: ConversionDisplayProps) {
  const { theme } = useCurrency().config;

  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm tracking-widest uppercase" style={{ color: theme.textSubtle }}>Loading...</p>
      </div>
    );
  }

  const isCHF = currency === "CHF";

  const formatted = isCHF
    ? result.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : formatCurrency(result, currency);

  return (
    <>
      <div className="py-7 text-center">
        <p
          className="font-light tracking-tight text-[#1A1A1A]"
          style={{ fontSize: "clamp(2.8rem, 12vw, 4rem)", lineHeight: "1" }}
        >
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.12em" }}>
            <RollingNumber formatted={formatted} />
            {isCHF && (
              <ChfSymbol
                style={{
                  width: "0.58em",
                  height: "0.88em",
                  verticalAlign: "baseline",
                  flexShrink: 0,
                  alignSelf: "flex-end",
                  marginBottom: "0.06em",
                }}
              />
            )}
          </span>
        </p>
      </div>
      <div className="px-1 py-3" style={{ borderTop: `1px solid ${theme.borderLight}` }}>
        {children}
      </div>
    </>
  );
}

export default ConversionDisplay;
