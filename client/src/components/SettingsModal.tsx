import * as React from "react";
import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { CURRENCIES, type ForeignCurrency } from "../lib/currencies";
import { type Language, getTranslation } from "../lib/translations";

const CURRENCY_ORDER: ForeignCurrency[] = ["JPY", "USD", "GBP", "TRY", "CHF"];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currency: ForeignCurrency;
  onCurrencyChange: (currency: ForeignCurrency) => void;
  hasShoppingItems: boolean;
}

function SettingsModal({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  currency,
  onCurrencyChange,
  hasShoppingItems,
}: SettingsModalProps) {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<ForeignCurrency | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
      setPendingCurrency(null);
      const t = setTimeout(() => setRendered(false), 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  function handleCurrencyTap(code: ForeignCurrency) {
    if (code === currency) return;
    if (hasShoppingItems) {
      setPendingCurrency(code);
    } else {
      commitCurrencyChange(code);
    }
  }

  function commitCurrencyChange(code: ForeignCurrency) {
    localStorage.setItem("tabi-currency", code);
    onCurrencyChange(code);
    onClose();
  }

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  if (!rendered) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        backgroundColor: visible ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(3px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(3px)" : "blur(0px)",
        transition: "background-color 0.28s ease, backdrop-filter 0.28s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-2xl overflow-hidden"
        style={{
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32,0.72,0,1)",
          paddingBottom: "env(safe-area-inset-bottom)",
          maxHeight: "85dvh",
          overflowY: "auto",
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#D4CEBC]" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E3D9]">
          <h2 className="text-base font-bold tracking-wide text-[#1A1A1A]">
            {t("settings")}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9B948A] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-6">
          <div className="space-y-3">
            <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#6B6560]">
              {t("language")}
            </label>
            <div className="flex gap-2">
              {(["en", "de"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className="flex-1 h-11 rounded-xl font-bold text-sm tracking-widest uppercase border-2 transition-all"
                  style={{
                    backgroundColor: language === lang ? "#1A1A1A" : "white",
                    borderColor: language === lang ? "#1A1A1A" : "#D4CEBC",
                    color: language === lang ? "white" : "#6B6560",
                  }}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#6B6560]">
              {t("currency")}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {CURRENCY_ORDER.map((code) => {
                const cfg = CURRENCIES[code];
                const isActive = currency === code;
                return (
                  <button
                    key={code}
                    onClick={() => handleCurrencyTap(code)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all"
                    style={{
                      backgroundColor: isActive ? cfg.theme.primary : "white",
                      borderColor: isActive ? cfg.theme.primary : "#D4CEBC",
                    }}
                  >
                    <span className="text-2xl">{cfg.flag}</span>
                    <div className="flex-1 text-left">
                      <span
                        className="font-bold text-sm tracking-widest"
                        style={{ color: isActive ? "white" : "#1A1A1A" }}
                      >
                        {code}
                      </span>
                      <span
                        className="block text-[11px] tracking-wide mt-0.5"
                        style={{ color: isActive ? "rgba(255,255,255,0.65)" : "#9B948A" }}
                      >
                        {language === "de" ? cfg.nameDE : cfg.name}
                      </span>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-white flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {pendingCurrency && (
          <div
            className="mx-5 mb-5 rounded-2xl border-2 p-4 space-y-3"
            style={{
              backgroundColor: CURRENCIES[pendingCurrency].theme.bg,
              borderColor: CURRENCIES[pendingCurrency].theme.border,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{CURRENCIES[pendingCurrency].flag}</span>
              <p className="text-sm font-semibold text-[#1A1A1A]">
                {t("currencyChangeWarning")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPendingCurrency(null)}
                className="flex-1 h-10 rounded-xl text-xs font-semibold border border-[#D4CEBC] text-[#6B6560]"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => commitCurrencyChange(pendingCurrency)}
                className="flex-1 h-10 rounded-xl text-xs font-bold text-white"
                style={{ backgroundColor: CURRENCIES[pendingCurrency].theme.primary }}
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsModal;
