import * as React from "react";
import { useState } from "react";
import { getTranslation, type Language } from "../lib/translations";
import { useCurrency } from "../contexts/CurrencyContext";
import { Input } from "./ui/input";

type Provider = "mastercard" | "visa" | "amex";

interface ProviderToggleProps {
  provider: Provider;
  onProviderChange: (provider: Provider) => void;
  isDark: boolean;
  language: Language;
  bankFeePct: number;
  onBankFeeChange: (fee: number) => void;
}

const OPTIONS: { id: Provider; colorLogo: string; alt: string }[] = [
  { id: "mastercard", colorLogo: "/logos/mastercard-color.svg", alt: "Mastercard" },
  { id: "visa",       colorLogo: "/logos/visa-color.svg",       alt: "Visa" },
  { id: "amex",       colorLogo: "/logos/amex-color.svg",       alt: "American Express" },
];

function ProviderToggle({ provider, onProviderChange, language, bankFeePct, onBankFeeChange }: ProviderToggleProps) {
  const { config } = useCurrency();
  const { theme } = config;
  const activeIndex = OPTIONS.findIndex(o => o.id === provider);
  const n = OPTIONS.length;

  const [isEditingFee, setIsEditingFee] = useState(false);
  const [feeEditValue, setFeeEditValue] = useState("");

  function handleFeeClick() {
    setFeeEditValue(bankFeePct > 0 ? String(bankFeePct) : "");
    setIsEditingFee(true);
  }

  function handleFeeSave() {
    const parsed = parseFloat(feeEditValue.replace(",", "."));
    onBankFeeChange(isNaN(parsed) || parsed < 0 ? 0 : parsed);
    setIsEditingFee(false);
  }

  function handleFeeCancel() {
    setIsEditingFee(false);
    setFeeEditValue("");
  }

  function handleFeeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleFeeSave();
    else if (e.key === "Escape") handleFeeCancel();
  }

  function handleFeeInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (v === "" || /^[0-9]*[,.]?[0-9]*$/.test(v)) setFeeEditValue(v);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
          {getTranslation(language, "cardProvider")}
          {bankFeePct > 0 && !isEditingFee && (
            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: theme.primary }}>
              +{bankFeePct}%
            </span>
          )}
        </label>
        <button
          onClick={handleFeeClick}
          className="inline-flex items-center gap-1 text-[10px] font-bold underline"
          style={{ color: theme.primary }}
        >
          {language === "de" ? "Bankgebühr" : "Bank Fee"}
        </button>
      </div>

      <div className="relative p-0.5 rounded-xl" style={{ background: theme.bgAccent, border: `1px solid ${theme.border}` }}>
        <div
          className="absolute top-0.5 bottom-0.5 rounded-lg shadow-sm"
          style={{
            background: theme.primary,
            width: `calc((100% - 4px) / ${n})`,
            left: `calc(${activeIndex} * (100% - 4px) / ${n} + 2px)`,
            transition: "left 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <div className="relative flex">
          {OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => onProviderChange(option.id)}
              className="flex-1 h-11 rounded-lg z-10 flex items-center justify-center"
              aria-label={option.alt}
            >
              <span className="relative flex items-center justify-center w-full h-full">
                <img src={option.colorLogo} alt={option.alt} className="w-full h-full object-contain" style={{ padding: "0px 4px" }} draggable={false} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {isEditingFee && (
        <div className="flex items-center gap-2 px-1 pt-0.5">
          <span className="text-[11px] uppercase tracking-widest flex-shrink-0" style={{ color: theme.textMuted }}>
            {language === "de" ? "Gebühr" : "Fee"}:
          </span>
          <div className="relative flex-1">
            <Input
              type="text"
              inputMode="decimal"
              value={feeEditValue}
              onChange={handleFeeInputChange}
              onKeyDown={handleFeeKeyDown}
              placeholder="0"
              className="h-8 rounded-lg text-sm px-3 pr-7 bg-white text-[#1A1A1A]"
              style={{ borderColor: theme.primary }}
              autoFocus
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: theme.textSubtle }}>%</span>
          </div>
          <button
            onClick={handleFeeSave}
            className="h-8 px-3 text-xs text-white rounded-lg flex-shrink-0"
            style={{ background: theme.primary }}
          >
            ✓
          </button>
          <button
            onClick={handleFeeCancel}
            className="h-8 px-2 text-xs rounded-lg flex-shrink-0"
            style={{ color: theme.textMuted, border: `1px solid ${theme.border}` }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default ProviderToggle;
export type { Provider };
