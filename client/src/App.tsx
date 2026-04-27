import * as React from "react";
import { useState, useEffect } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CurrencyProvider, useCurrency } from "./contexts/CurrencyContext";
import CurrencyConverter from "./components/CurrencyConverter";
import CurrencySelector from "./components/CurrencySelector";
import { useLanguage } from "./contexts/LanguageContext";
import type { Language } from "./lib/translations";

function isMobileDevice(): boolean {
  const ua = navigator.userAgent;
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  return mobileUA || (hasTouch && window.innerWidth <= 1024);
}

function DesktopBlock() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(t); }, []);

  const primary = "#3D6B5E";

  return (
    <div className="fixed inset-0" style={{ background: "#000" }}>
      <style>{`
        @keyframes tabi-d-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.05); }
        }
      `}</style>

      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #000 0%, " + primary + " 40%, " + primary + " 60%, #000 100%)",
          opacity: mounted ? 0.75 : 0,
          transition: "opacity 0.8s ease",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          mixBlendMode: "overlay",
        }}
      />

      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{ height: "22%", background: "linear-gradient(to bottom, #000 0%, transparent 100%)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: "22%", background: "linear-gradient(to top, #000 0%, transparent 100%)" }}
      />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="w-full max-w-sm flex flex-col gap-8 items-center">

          <img
            src="/tabi-logo-horizontal.svg"
            alt="Tabi"
            style={{ height: "52px", width: "auto", filter: "brightness(0) invert(1) opacity(0.9)" }}
            draggable={false}
          />

          <div
            className="w-full rounded-2xl px-7 py-8 flex flex-col items-center gap-5 text-center"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="rounded-2xl flex items-center justify-center"
              style={{
                width: 64,
                height: 64,
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.15)",
                animation: "tabi-d-pulse 3s ease-in-out infinite",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="7" y="1.5" width="16" height="27" rx="3.5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6"/>
                <rect x="12" y="4" width="6" height="1.5" rx="0.75" fill="rgba(255,255,255,0.4)"/>
                <circle cx="15" cy="25.5" r="1.2" fill="rgba(255,255,255,0.45)"/>
                <path d="M11 12.5h3.2M11 15.5h8M11 18.5h5.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="font-semibold text-[17px] tracking-wide text-white">
                Best experienced on mobile
              </h1>
              <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                Open TABI on your iPhone or Android for the full experience — built for on-the-go currency conversion while travelling.
              </p>
            </div>
          </div>

          <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
            © Tabi Currency Converter
          </p>

        </div>
      </div>
    </div>
  );
}

function AppInner() {
  const { hasChosen } = useCurrency();
  const { language, setLanguage } = useLanguage();

  if (!hasChosen) {
    return <CurrencySelector language={language as Language} onLanguageChange={setLanguage} />;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--tabi-bg, #F0EDE6)" }}>
      <CurrencyConverter isDark={false} />
    </div>
  );
}

function App() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => { setIsDesktop(!isMobileDevice()); }, []);

  if (isDesktop === null) return null;
  if (isDesktop) return <DesktopBlock />;

  return (
    <LanguageProvider>
      <CurrencyProvider>
        <AppInner />
      </CurrencyProvider>
    </LanguageProvider>
  );
}

export default App;
