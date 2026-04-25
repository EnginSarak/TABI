import * as React from "react";
import { CURRENCIES, type ForeignCurrency } from "../lib/currencies";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../lib/translations";

const CURRENCY_ORDER: ForeignCurrency[] = ["JPY", "USD", "GBP", "TRY", "CHF"];

interface CurrencyCardProps {
  code: ForeignCurrency;
  onSelect: (c: ForeignCurrency) => void;
  language: string;
}

function CurrencyCard({ code, onSelect, language }: CurrencyCardProps) {
  const config = CURRENCIES[code];
  const [pressed, setPressed] = React.useState(false);

  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onSelect(code); }}
      onPointerLeave={() => setPressed(false)}
      className="relative flex flex-col items-center justify-center rounded-2xl overflow-hidden select-none"
      style={{
        backgroundColor: config.theme.primary,
        transform: pressed ? "scale(0.96)" : "scale(1)",
        transition: pressed ? "none" : "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        minHeight: "120px",
        boxShadow: `0 4px 20px ${config.theme.primary}40`,
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 30% 30%, white 0%, transparent 70%)`,
        }}
      />
      <span className="text-4xl mb-2 relative z-10 select-none" style={{ lineHeight: 1 }}>
        {config.flag}
      </span>
      <span className="text-white font-bold text-xl tracking-widest relative z-10">
        {config.code}
      </span>
      <span className="text-white/70 text-[11px] tracking-wide mt-0.5 relative z-10 px-2 text-center">
        {language === "de" ? config.nameDE : config.name}
      </span>
    </button>
  );
}

interface CurrencySelectionScreenProps {
  onSelect: (currency: ForeignCurrency) => void;
}

function CurrencySelectionScreen({ onSelect }: CurrencySelectionScreenProps) {
  const { language } = useLanguage();

  function handleSelect(currency: ForeignCurrency) {
    localStorage.setItem("tabi-currency", currency);
    onSelect(currency);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#F0EDE6", paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex-1 flex flex-col px-5 pt-8 pb-8">
        <div className="flex justify-center mb-8">
          <img
            src="/tabi-logo-horizontal.svg"
            alt="Tabi"
            className="h-8 opacity-60"
            style={{ filter: "invert(15%) sepia(20%) saturate(300%) hue-rotate(180deg)" }}
            draggable={false}
          />
        </div>

        <div className="text-center mb-8 space-y-2">
          <h1 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight leading-tight">
            {getTranslation(language as "en" | "de", "chooseYourCurrency")}
          </h1>
          <p className="text-[13px] text-[#9B948A] tracking-wide">
            {getTranslation(language as "en" | "de", "chooseSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {CURRENCY_ORDER.slice(0, 4).map((code) => (
            <CurrencyCard key={code} code={code} onSelect={handleSelect} language={language} />
          ))}
          <div className="col-span-2">
            <CurrencyCard
              key={CURRENCY_ORDER[4]}
              code={CURRENCY_ORDER[4]}
              onSelect={handleSelect}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrencySelectionScreen;
