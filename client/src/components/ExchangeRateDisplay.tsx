import * as React from "react";
import { useState } from "react";
import { formatRate } from "../lib/formatter";
import { Input } from "./ui/input";
import { X, Lock } from "lucide-react";
import { getTranslation, type Language } from "../lib/translations";
import { useCurrency } from "../contexts/CurrencyContext";

interface Props {
  rate: number;
  isManual: boolean;
  onManualRateChange: (rate: number | null) => void;
  isDark: boolean;
  language: Language;
}

function ExchangeRateDisplay({ rate, isManual, onManualRateChange, language }: Props) {
  const { config } = useCurrency();
  const { theme, symbol } = config;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  function handleEditClick() { setIsEditing(true); setEditValue(rate.toFixed(4)); }
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) setEditValue(v);
  }
  function handleSave() {
    const n = parseFloat(editValue);
    if (n > 0) { onManualRateChange(n); setIsEditing(false); }
  }
  function handleCancel() { setIsEditing(false); setEditValue(""); }
  function handleReset() { onManualRateChange(null); setIsEditing(false); }
  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSave();
    else if (e.key === "Escape") handleCancel();
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 justify-center">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
          {getTranslation(language, "rate")}: 1 € =
        </span>
        <Input
          type="text" inputMode="decimal" value={editValue}
          onChange={handleInputChange} onKeyDown={handleKeyPress}
          className="h-7 w-24 text-xs px-2 bg-white text-[#1A1A1A]"
          style={{ borderColor: theme.primary }}
          autoFocus
        />
        <span className="text-[11px]" style={{ color: theme.textMuted }}>{symbol}</span>
        <button onClick={handleSave} className="h-7 px-2 text-xs text-white rounded" style={{ background: theme.primary }}>✓</button>
        <button onClick={handleCancel} className="h-7 px-2 text-xs rounded" style={{ color: theme.textMuted }}>✕</button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={handleEditClick}
        className="text-[11px] tracking-wider uppercase font-medium transition-colors cursor-pointer hover:underline"
        style={{ color: isManual ? theme.primary : theme.textMuted }}
      >
        {isManual && <Lock className="inline h-3 w-3 mr-1" />}
        {getTranslation(language, "rate")}: 1 € = {formatRate(rate)} {symbol}
      </button>
      {isManual && (
        <button
          onClick={handleReset}
          className="h-5 w-5 flex items-center justify-center transition-colors"
          style={{ color: theme.textSubtle }}
          title={getTranslation(language, "resetRate")}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export default ExchangeRateDisplay;
