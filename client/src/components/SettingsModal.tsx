import * as React from "react";
import { useState, useEffect } from "react";
import type { ForeignCurrency } from "../lib/currencies";
import { CURRENCIES } from "../lib/currencies";
import { useCurrency } from "../contexts/CurrencyContext";
import type { Language } from "../lib/translations";
import FlagIcon from "./FlagIcon";


const CURRENCY_LIST: ForeignCurrency[] = ["JPY", "USD", "GBP", "TRY", "CHF"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (l: Language) => void;
}

function SettingsModal({ isOpen, onClose, language, onLanguageChange }: Props) {
  const { currency, setCurrency, config } = useCurrency();
  const { theme } = config;
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setRendered(false), 380);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!rendered) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        backgroundColor: visible ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(4px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(4px)" : "blur(0px)",
        transition: "background-color 0.25s ease, backdrop-filter 0.25s ease",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="absolute left-4 right-4 rounded-3xl flex flex-col overflow-hidden"
        style={{
          background: theme.bgCard,
          maxHeight: "88dvh",
          top: "50%",
          transform: visible ? "translateY(-50%) scale(1)" : "translateY(-44%) scale(0.94)",
          opacity: visible ? 1 : 0,
          transition: visible
            ? "transform 0.44s cubic-bezier(0.22,1,0.36,1), opacity 0.28s ease"
            : "transform 0.3s cubic-bezier(0.4,0,1,1), opacity 0.22s ease",
          boxShadow: "0 12px 60px rgba(0,0,0,0.22)",
        }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
          <h2 className="text-[15px] font-semibold tracking-wide text-[#1A1A1A]">
            {language === "de" ? "Einstellungen" : "Settings"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            style={{ background: theme.bgAccent, color: theme.textSubtle }}
          >
            <span className="text-[13px]">✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
              {language === "de" ? "Sprache" : "Language"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["en", "de"] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className="h-12 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center"
                  style={{
                    background: language === lang ? theme.primary : theme.bgInput,
                    color: language === lang ? "#fff" : theme.textMuted,
                    border: `1.5px solid ${language === lang ? theme.primary : theme.border}`,
                  }}
                >
                  <span>{lang === "en" ? "English" : "Deutsch"}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
              {language === "de" ? "Reisewährung" : "Travel Currency"}
            </p>
            <div className="flex flex-col gap-2">
              {CURRENCY_LIST.map(code => {
                const c = CURRENCIES[code];
                const isActive = currency === code;
                return (
                  <button
                    key={code}
                    onClick={() => { setCurrency(code); onClose(); }}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all active:scale-[0.98]"
                    style={{
                      background: isActive ? theme.primary : theme.bgInput,
                      border: `1.5px solid ${isActive ? theme.primary : theme.border}`,
                    }}
                  >
                    <FlagIcon code={code} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[14px] leading-tight" style={{ color: isActive ? "#fff" : "#1A1A1A" }}>
                        {language === "de" ? c.nameDE : c.nameEN}
                      </p>
                      <p className="text-[11px] mt-0.5 tracking-wide" style={{ color: isActive ? "rgba(255,255,255,0.55)" : theme.textSubtle }}>
                        {c.code} · {c.symbol}
                      </p>
                    </div>
                    {isActive && (
                      <span className="text-white/70 text-base flex-shrink-0">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
