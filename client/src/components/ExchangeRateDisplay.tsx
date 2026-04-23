import * as React from "react";
import { useState } from "react";
import { formatRate } from "../lib/formatter";
import { Input } from "./ui/input";
import { X, Lock } from "lucide-react";
import { getTranslation, type Language } from "../lib/translations";

interface ExchangeRateDisplayProps {
  rate: number;
  isManual: boolean;
  onManualRateChange: (rate: number | null) => void;
  isDark: boolean;
  language: Language;
}

function ExchangeRateDisplay({ rate, isManual, onManualRateChange, language }: ExchangeRateDisplayProps) {
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
        <span className="text-[11px] text-[#6B6560] uppercase tracking-wider">
          {getTranslation(language, "rate")}: 1 € =
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="h-7 w-20 text-xs px-2 border-[#1B2A4A] bg-white text-[#1A1A1A]"
          autoFocus
        />
        <span className="text-[11px] text-[#6B6560]">¥</span>
        <button onClick={handleSave} className="h-7 px-2 text-xs bg-[#1B2A4A] text-white rounded">✓</button>
        <button onClick={handleCancel} className="h-7 px-2 text-xs text-[#6B6560] hover:text-[#1A1A1A] rounded">✕</button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={handleEditClick}
        className={`text-[11px] tracking-wider uppercase font-medium transition-colors cursor-pointer hover:underline ${
          isManual ? "text-[#2D4A8A]" : "text-[#6B6560]"
        }`}
      >
        {isManual && <Lock className="inline h-3 w-3 mr-1" />}
        {getTranslation(language, "rate")}: 1 € = {formatRate(rate)} ¥
      </button>
      {isManual && (
        <button
          onClick={handleReset}
          className="h-5 w-5 flex items-center justify-center text-[#9B948A] hover:text-[#1A1A1A] transition-colors"
          title={getTranslation(language, "resetRate")}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export default ExchangeRateDisplay;
