import * as React from "react";
import { useRef, useLayoutEffect } from "react";
import { formatCurrency } from "../lib/formatter";
import type { ForeignCurrency } from "../lib/currencies";

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
          return (
            <span
              key={i}
              style={{ display: "inline-block", lineHeight: "1", alignSelf: "flex-end" }}
            >
              {char}
            </span>
          );
        }

        return (
          <span
            key={i}
            style={{
              display:       "inline-block",
              overflow:      "hidden",
              height:        "1em",
              lineHeight:    "1",
              verticalAlign: "bottom",
            }}
          >
            <span
              key={changed ? `${i}-${char}-${formatted}` : `${i}-${char}`}
              style={{
                display:   "block",
                animation: changed ? "rollIn 0.22s cubic-bezier(0.2,0,0,1) both" : "none",
              }}
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
  borderAlt: string;
}

function ConversionDisplay({ result, currency, isLoading, children, borderAlt }: ConversionDisplayProps) {
  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm tracking-widest uppercase" style={{ color: "#9B948A" }}>
          Wechselkurs wird geladen...
        </p>
      </div>
    );
  }

  const formatted = formatCurrency(result, currency);

  return (
    <>
      <div className="py-7 text-center">
        <p
          className="font-light tracking-tight text-[#1A1A1A]"
          style={{ fontSize: "clamp(2.8rem, 12vw, 4rem)", lineHeight: "1" }}
        >
          <RollingNumber formatted={formatted} />
        </p>
      </div>
      <div className="px-1 py-3" style={{ borderTop: `1px solid ${borderAlt}` }}>
        {children}
      </div>
    </>
  );
}

export default ConversionDisplay;
