import * as React from "react";
import { getTranslation, type Language } from "../lib/translations";

type TaxMode = "netto" | "zeikomi";

interface TaxToggleProps {
  taxMode: TaxMode;
  onTaxModeChange: (mode: TaxMode) => void;
  isDark: boolean;
  language: Language;
}

const OPTIONS: { id: TaxMode; labelKey: "netto" | "tax"; sub: string }[] = [
  { id: "netto",    labelKey: "netto", sub: "税抜 · Zeinuki" },
  { id: "zeikomi", labelKey: "tax",   sub: "税込 · Zeikomi" },
];

function TaxToggle({ taxMode, onTaxModeChange, language }: TaxToggleProps) {
  const activeIndex = OPTIONS.findIndex(o => o.id === taxMode);
  const n = OPTIONS.length;

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#6B6560]">
        {getTranslation(language, "taxAdjustment")}
      </label>

      <div className="relative p-1 bg-[#F0EDE6] rounded-xl border border-[#D4CEBC]">
        <div
          className="absolute top-1 bottom-1 rounded-lg bg-[#1B2A4A] shadow-sm"
          style={{
            width:      `calc((100% - 8px) / ${n})`,
            left:       `calc(${activeIndex} * (100% - 8px) / ${n} + 4px)`,
            transition: "left 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        <div className="relative flex">
          {OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => onTaxModeChange(option.id)}
              className={`flex-1 h-12 rounded-lg text-sm font-semibold tracking-wide transition-colors duration-150 z-10 ${
                taxMode === option.id
                  ? "text-white"
                  : "text-[#6B6560] hover:text-[#1B2A4A]"
              }`}
            >
              <div className="flex flex-col items-center leading-tight">
                <span>{getTranslation(language, option.labelKey)}</span>
                <span className="text-[10px] font-normal opacity-60 tracking-normal mt-0.5">{option.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TaxToggle;
