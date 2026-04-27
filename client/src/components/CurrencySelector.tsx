import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ForeignCurrency } from "../lib/currencies";
import { CURRENCIES } from "../lib/currencies";
import { useCurrency } from "../contexts/CurrencyContext";
import type { Language } from "../lib/translations";
import ChfSymbol from "./ChfSymbol";
import FlagIcon from "./FlagIcon";

const CURRENCY_LIST: ForeignCurrency[] = ["JPY", "USD", "GBP", "TRY", "CHF"];

interface Props {
  language: Language;
  onLanguageChange: (l: Language) => void;
}

// Slide to Unlock Komponente (iPhone Style)
const SlideToUnlock = ({ language, onConfirm, theme }: { language: Language; onConfirm: () => void; theme: any }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [handlePosition, setHandlePosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const startX = useRef(0);
  const maxTrackWidth = useRef(0);

  const themePrimary = theme.primary;
  const themeDarkBg = "#111111"; 
  const themeText = "#FFFFFF";

  const updateMaxTrackWidth = useCallback(() => {
    if (containerRef.current && handleRef.current) {
      maxTrackWidth.current = containerRef.current.offsetWidth - handleRef.current.offsetWidth - 10;
    }
  }, []);

  useEffect(() => {
    updateMaxTrackWidth();
    window.addEventListener("resize", updateMaxTrackWidth);
    return () => window.removeEventListener("resize", updateMaxTrackWidth);
  }, [updateMaxTrackWidth]);

  const onStart = useCallback((e: TouchEvent | MouseEvent) => {
    if (isUnlocked) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startX.current = clientX - handlePosition;
    if (handleRef.current) {
      handleRef.current.style.transition = 'none';
    }
  }, [handlePosition, isUnlocked]);

  const onMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const newPosition = clientX - startX.current;
    const clampedPosition = Math.max(0, Math.min(newPosition, maxTrackWidth.current));
    setHandlePosition(clampedPosition);
  }, [isDragging]);

  const onEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (handlePosition > maxTrackWidth.current * 0.9) {
      setIsUnlocked(true);
      onConfirm();
    } else {
      setHandlePosition(0);
      if (handleRef.current) {
        handleRef.current.style.transition = 'left 0.3s ease-out';
      }
    }
  }, [isDragging, handlePosition, onConfirm]);

  useEffect(() => {
    const handle = handleRef.current;
    if (handle) {
      handle.addEventListener("touchstart", onStart);
      handle.addEventListener("mousedown", onStart);
    }
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchend", onEnd);
    window.addEventListener("mouseup", onEnd);

    return () => {
      if (handle) {
        handle.removeEventListener("touchstart", onStart);
        handle.removeEventListener("mousedown", onStart);
      }
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("mouseup", onEnd);
    };
  }, [onStart, onMove, onEnd]);

  return (
    <div className="w-full max-w-sm px-6">
      <div
        ref={containerRef}
        className="w-full h-16 rounded-3xl p-1 relative flex items-center overflow-hidden border-[1.5px]"
        style={{
          background: themeDarkBg,
          borderColor: `rgba(255,255,255,0.06)`,
        }}
      >
        <p
          className="absolute inset-x-0 text-center font-semibold text-[15px] tracking-wide pointer-events-none tabi-text-shimmer"
          style={{
            color: isUnlocked ? "rgba(255,255,255,0.2)" : themeText,
            transition: "color 0.2s ease",
          }}
        >
          {language === "de" ? "Schieben zum Starten →" : "Slide to Get Started →"}
        </p>
        
        <style>
          {`
            @keyframes tabiTextShimmer {
              0% { background-position: -200px 0; }
              100% { background-position: 200px 0; }
            }
            .tabi-text-shimmer {
              background: linear-gradient(to right, rgba(255,255,255,0.2) 0%, ${themePrimary} 50%, rgba(255,255,255,0.2) 100%);
              background-size: 200px 100%;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: tabiTextShimmer 2.5s infinite linear;
            }
          `}
        </style>

        <div
          ref={handleRef}
          className="w-14 h-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing absolute left-1"
          style={{
            background: isUnlocked ? themePrimary : `rgba(255,255,255,0.1)`,
            left: `${handlePosition + 4}px`,
            transition: isDragging ? 'none' : 'left 0.3s ease-out',
            borderColor: `rgba(255,255,255,0.1)`,
            borderWidth: '1.5px',
          }}
        >
          <div className="text-white text-lg font-black">{">"}</div>
        </div>
      </div>
    </div>
  );
};

function CurrencySelector({ language, onLanguageChange }: Props) {
  const { setCurrency } = useCurrency();
  const [selected, setSelected] = useState<ForeignCurrency>("JPY");
  const [displayedTheme, setDisplayedTheme] = useState(CURRENCIES["JPY"].theme);
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [bgVisible, setBgVisible] = useState(true);
  const blinkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const existing = document.querySelector('meta[name="theme-color"]');
    if (existing) existing.remove();
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#000000";
    document.head.appendChild(meta);
    document.documentElement.style.backgroundColor = "#000";
    document.body.style.backgroundColor = "#000";
  }, []);

  function handleSelect(code: ForeignCurrency) {
    if (code === selected) return;
    if (blinkTimeout.current) clearTimeout(blinkTimeout.current);

    setSelected(code);
    setBgVisible(false);
    blinkTimeout.current = setTimeout(() => {
      setDisplayedTheme(CURRENCIES[code].theme);
      setBgVisible(true);
    }, 250);
  }

  const handleConfirm = useCallback(() => {
    setLeaving(true);
    setTimeout(() => setCurrency(selected), 420);
  }, [setCurrency, selected]);

  const theme = displayedTheme;

  return (
    <div className="fixed inset-0 z-[100]" style={{ background: "#000" }}>

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, #000 0%, ${theme.primary} 40%, ${theme.primary} 60%, #000 100%)`,
          opacity: bgVisible ? 0.8 : 0,
          transition: bgVisible ? "opacity 0.6s ease" : "opacity 0.3s ease",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04, 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
          zIndex: 1,
        }}
      />

      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "22%",
          background: "linear-gradient(to bottom, #000 0%, transparent 100%)",
          zIndex: 2,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "22%",
          background: "linear-gradient(to top, #000 0%, transparent 100%)",
          zIndex: 2,
        }}
      />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6"
        style={{
          opacity: mounted && !leaving ? 1 : 0,
          transform: leaving ? "scale(1.05)" : "scale(1)",
          transition: leaving
            ? "opacity 0.42s ease, transform 0.42s ease"
            : "opacity 0.4s ease",
          zIndex: 3,
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="w-full max-w-sm flex flex-col gap-6 items-center">
          <div className="text-center space-y-3">
            <img
              src="/tabi-logo-horizontal.svg"
              alt="Tabi"
              className="h-11 mx-auto"
              style={{ filter: "brightness(0) invert(1) opacity(0.9)" }}
              draggable={false}
            />
            <p className="text-white/50 text-[11px] tracking-widest uppercase">
              {language === "de" ? "Wähle deine Reisewährung" : "Choose your travel currency"}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 w-full">
            {CURRENCY_LIST.map((code, i) => {
              const c = CURRENCIES[code];
              const isActive = selected === code;
              return (
                <button
                  key={code}
                  onClick={() => handleSelect(code)}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-left w-full"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.17)" : "rgba(255,255,255,0.06)",
                    border: `1.5px solid ${isActive ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.10)"}`,
                    transform: mounted ? (isActive ? "scale(1.015)" : "scale(1)") : "translateY(20px)",
                    opacity: mounted ? 1 : 0,
                    transition: `all 0.2s cubic-bezier(0.34,1.2,0.64,1), opacity 0.35s ease ${i * 0.06}s, transform 0.35s ease ${i * 0.06}s`,
                  }}
                >
                  <FlagIcon code={code} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-[14px] leading-tight">
                      {language === "de" ? c.nameDE : c.nameEN}
                    </p>
                    <p className="text-white/45 text-[11px] mt-0.5 tracking-wide">
                      {c.code} · {c.code === "CHF" ? <ChfSymbol /> : c.symbol}
                    </p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isActive && (
                      <span style={{ color: theme.primary, fontSize: "11px", fontWeight: 700 }}>✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <SlideToUnlock language={language} onConfirm={handleConfirm} theme={theme} />

          <div className="space-y-3 w-full">
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
    </div>
  );
}

export default CurrencySelector;
