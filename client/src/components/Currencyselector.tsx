import * as React from "react";
import { useState, useEffect } from "react";
import type { ForeignCurrency } from "../lib/currencies";
import { CURRENCIES } from "../lib/currencies";
import { useCurrency } from "../contexts/CurrencyContext";
import type { Language } from "../lib/translations";

const CURRENCY_LIST: ForeignCurrency[] = ["JPY", "USD", "GBP", "TRY", "CHF"];

interface Props {
  language: Language;
  onLanguageChange: (l: Language) => void;
}

function CurrencySelector({ language, onLanguageChange }: Props) {
  const { setCurrency } = useCurrency();
  const [selected, setSelected] = useState<ForeignCurrency>("JPY");
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => { const t = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(t); }, []);

  function handleConfirm() {
    setLeaving(true);
    setTimeout(() => setCurrency(selected), 420);
  }

  const theme = CURRENCIES[selected].theme;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
      style={{
        background: `linear-gradient(155deg, ${theme.primary} 0%, ${theme.primaryHover} 100%)`,
        opacity: mounted && !leaving ? 1 : 0,
        transform: leaving ? "scale(1.05)" : "scale(1)",
        transition: leaving
          ? "opacity 0.42s ease, transform 0.42s ease"
          : "opacity 0.4s ease, background 0.5s cubic-bezier(0.4,0,0.2,1)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center space-y-3">
          <img src="/tabi-logo-horizontal.svg" alt="Tabi" className="h-9 mx-auto" style={{ filter: "brightness(0) invert(1) opacity(0.9)" }} draggable={false} />
          <p className="text-white/50 text-[11px] tracking-widest uppercase">
            {language === "de" ? "Wähle deine Reisewährung" : "Choose your travel currency"}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {CURRENCY_LIST.map((code, i) => {
            const c = CURRENCIES[code];
            const isActive = selected === code;
            return (
              <button
                key={code}
                onClick={() => setSelected(code)}
                className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-left"
                style={{
                  background: isActive ? "rgba(255,255,255,0.17)" : "rgba(255,255,255,0.06)",
                  border: `1.5px solid ${isActive ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.10)"}`,
                  transform: mounted ? (isActive ? "scale(1.015)" : "scale(1)") : "translateY(20px)",
                  opacity: mounted ? 1 : 0,
                  transition: `all 0.2s cubic-bezier(0.34,1.2,0.64,1), opacity 0.35s ease ${i * 0.06}s, transform 0.35s ease ${i * 0.06}s`,
                }}
              >
                <span className="text-[28px] select-none leading-none">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-[14px] leading-tight">
                    {language === "de" ? c.nameDE : c.nameEN}
                  </p>
                  <p className="text-white/45 text-[11px] mt-0.5 tracking-wide">{c.code} · {c.symbol}</p>
                </div>
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isActive && <span style={{ color: theme.primary, fontSize: "11px", fontWeight: 700 }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full h-14 rounded-2xl font-bold text-[15px] tracking-wide active:scale-95 transition-all"
            style={{ background: "rgba(255,255,255,0.95)", color: theme.primary }}
          >
            {language === "de" ? "Los geht's →" : "Get Started →"}
          </button>

          <div className="flex gap-2 justify-center">
            {(["en", "de"] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className="px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase transition-all"
                style={{
                  background: language === lang ? "rgba(255,255,255,0.2)" : "transparent",
                  color: language === lang ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                  border: `1px solid ${language === lang ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                {lang === "en" ? "EN" : "DE"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrencySelector;
