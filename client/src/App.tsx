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
  return (
    <div className="min-h-screen bg-[#F0EDE6] flex flex-col items-center justify-center px-8">
      <style>{`
        @keyframes tabi-desktop-fade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .tabi-desktop-fade { animation: tabi-desktop-fade 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .tabi-desktop-fade-delay { animation: tabi-desktop-fade 0.55s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
      `}</style>
      <div className="text-center w-full max-w-[380px] space-y-8">
        <div className="tabi-desktop-fade">
          <img
            src="/tabi-logo-horizontal.svg"
            alt="Tabi"
            className="mx-auto"
            style={{ height: "52px", width: "auto", opacity: 0.92 }}
            draggable={false}
          />
        </div>
        <div className="tabi-desktop-fade-delay bg-white rounded-2xl border border-[#D4CEBC] px-8 py-9 shadow-sm space-y-6">
          <div className="flex justify-center">
            <div
              className="rounded-2xl flex items-center justify-center"
              style={{ width: 64, height: 64, background: "#F0EDE6", border: "1.5px solid #D4CEBC" }}
            >
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="7" y="1.5" width="16" height="27" rx="3.5" stroke="#3D6B5E" strokeWidth="1.6"/>
                <rect x="12" y="4" width="6" height="1.5" rx="0.75" fill="#3D6B5E" opacity="0.4"/>
                <circle cx="15" cy="25.5" r="1.2" fill="#3D6B5E" opacity="0.5"/>
                <path d="M11 12.5h3.2M11 15.5h8M11 18.5h5.5" stroke="#3D6B5E" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="space-y-2.5">
            <h1 className="font-bold text-[18px] tracking-wide" style={{ color: "#1B2A4A" }}>
              Best experienced on mobile
            </h1>
            <p className="text-[13.5px] leading-relaxed" style={{ color: "#6B6560" }}>
              For the full Tabi experience, open this page on your iPhone or Android device — optimised for on-the-go currency conversion while travelling.
            </p>
          </div>
          <div className="rounded-xl px-4 py-3 space-y-1" style={{ background: "#F7F4EE", border: "1px solid #E8E3D9" }}>
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#A09890" }}>Open on your phone</p>
            <p className="text-[12px] font-medium" style={{ color: "#3D6B5E" }}>tabi-currency-converter.vercel.app</p>
          </div>
        </div>
        <p className="text-[10px] tracking-widest uppercase" style={{ color: "#C5BFB3" }}>© Tabi Currency Converter</p>
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
