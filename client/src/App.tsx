import * as React from "react";
import { useState, useEffect } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import CurrencyConverter from "./components/CurrencyConverter";

function isMobileDevice(): boolean {
  const ua = navigator.userAgent;
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const narrowScreen = window.innerWidth <= 1024;
  return mobileUA || (hasTouch && narrowScreen);
}

function DesktopBlock() {
  return (
    <div className="min-h-screen bg-[#F0EDE6] flex flex-col items-center justify-center px-8">
      <div className="text-center w-full max-w-[360px]">
        <img
          src="/tabi-logo-horizontal.svg"
          alt="Tabi"
          className="h-9 mx-auto mb-10 opacity-80"
          draggable={false}
        />
        <div className="bg-white rounded-2xl border border-[#D4CEBC] px-8 py-10 space-y-5 shadow-sm">
          <div className="text-5xl select-none">📱</div>
          <div className="space-y-2">
            <h1 className="text-[#1B2A4A] font-bold text-[20px] tracking-wide">
              Mobile Only
            </h1>
            <p className="text-[#6B6560] text-[14px] leading-relaxed">
              Tabi is designed exclusively for smartphones. Please open this page on your iPhone or Android device.
            </p>
          </div>
          <div className="pt-2 border-t border-[#E8E3D9]">
            <p className="text-[#C5BFB3] text-[11px] tracking-widest uppercase">
              tabi-currency-converter.vercel.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDesktop(!isMobileDevice());
  }, []);

  if (isDesktop === null) return null;

  if (isDesktop) {
    return <DesktopBlock />;
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#F0EDE6]">
        <CurrencyConverter isDark={false} />
      </div>
    </LanguageProvider>
  );
}

export default App;
