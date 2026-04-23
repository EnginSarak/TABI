import * as React from "react";
import { getTranslation, type Language } from "../lib/translations";

type Provider = "mastercard" | "visa" | "amex";

interface ProviderToggleProps {
  provider: Provider;
  onProviderChange: (provider: Provider) => void;
  isDark: boolean;
  language: Language;
}

const OPTIONS: { id: Provider; colorLogo: string; alt: string }[] = [
  { id: "mastercard", colorLogo: "/logos/mastercard-color.svg", alt: "Mastercard" },
  { id: "visa",       colorLogo: "/logos/visa-color.svg",       alt: "Visa" },
  { id: "amex",       colorLogo: "/logos/amex-color.svg",       alt: "American Express" },
];

function ProviderToggle({ provider, onProviderChange, language }: ProviderToggleProps) {
  const activeIndex = OPTIONS.findIndex(o => o.id === provider);
  const n = OPTIONS.length;

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#6B6560]">
        {getTranslation(language, "cardProvider")}
      </label>

      <div className="relative p-0.5 bg-[#F0EDE6] rounded-xl border border-[#D4CEBC]">
        <div
          className="absolute top-0.5 bottom-0.5 rounded-lg bg-[#1B2A4A] shadow-sm"
          style={{
            width:      `calc((100% - 4px) / ${n})`,
            left:       `calc(${activeIndex} * (100% - 4px) / ${n} + 2px)`,
            transition: "left 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        <div className="relative flex">
          {OPTIONS.map(option => {
            const isActive = provider === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onProviderChange(option.id)}
                className="flex-1 h-11 rounded-lg z-10 flex items-center justify-center"
                aria-label={option.alt}
              >
                <span className="relative flex items-center justify-center w-full h-full">
                  <img
                    src={option.colorLogo}
                    alt={option.alt}
                    className="w-full h-full object-contain"
                    style={{ padding: "0px 4px" }}
                    draggable={false}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProviderToggle;
export type { Provider };
