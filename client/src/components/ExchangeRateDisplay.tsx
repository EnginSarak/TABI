import * as React from "react";
import { useState } from "react";
import { formatRate } from "../lib/formatter";
import { Input } from "./ui/input";
import { X, Lock } from "lucide-react";
import { getTranslation, type Language } from "../lib/translations";
import type { CurrencyTheme } from "../lib/currencies";

interface ExchangeRateDisplayProps {
  rate: number;
  isManual: boolean;
  onManualRateChange: (rate: number | null) => void;
  isDark: boolean;
  language: Language;
  foreignSymbol: string;
  theme: CurrencyTheme;
}

function ExchangeRateDisplay({
  rate,
  isManual,
  onManualRateChange,
  language,
  foreignSymbol,
  theme,
}: ExchangeRateDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  function handleEditClick() {
    setIsEditing(true);
    setEditValue(rate.toFixed(2));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) setEditValue(value);
  }

  function handleSave() {
    const newRate = parseFloat(editValue);
    if (newRate > 0) { onManualRateChange(newRate); setIsEditing(false); }
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
          type="text"
          inputMode="decimal"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="h-7 w-20 text-xs px-2 bg-white text-[#1A1A1A]"
          style={{ borderColor: theme.primary }}
          autoFocus
        />
        <span className="text-[11px]" style={{ color: theme.textMuted }}>{foreignSymbol}</span>
        <button
          onClick={handleSave}
          className="h-7 px-2 text-xs text-white rounded"
          style={{ backgroundColor: theme.primary }}
        >
          ✓
        </button>
        <button
          onClick={handleCancel}
          className="h-7 px-2 text-xs rounded hover:text-[#1A1A1A]"
          style={{ color: theme.textMuted }}
        >
          ✕
        </button>
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
        {getTranslation(language, "rate")}: 1 € = {formatRate(rate)} {foreignSymbol}
      </button>
      {isManual && (
        <button
          onClick={handleReset}
          className="h-5 w-5 flex items-center justify-center transition-colors hover:text-[#1A1A1A]"
          style={{ color: theme.textFaint }}
          title={getTranslation(language, "resetRate")}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export default ExchangeRateDisplay;
