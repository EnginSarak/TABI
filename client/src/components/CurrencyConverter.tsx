import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import ProviderToggle, { type Provider } from "./ProviderToggle";
import ConversionDisplay from "./ConversionDisplay";
import ExchangeRateDisplay from "./ExchangeRateDisplay";
import ShoppingList, { type ShoppingItem } from "./ShoppingList";
import SettingsModal from "./SettingsModal";
import TaxFreeInfoModal from "./TaxFreeInfoModal";
import ChfSymbol from "./ChfSymbol";
import { fetchExchangeRate, getCachedRate } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { getTranslation } from "../lib/translations";
import { usePersistentState, lsGet, lsSet } from "../lib/storage";
import { formatCurrency } from "../lib/formatter";
import {
  ShoppingCart, Plus, Minus, ArrowUp, ArrowDown,
  Tag, Wallet, ChevronDown, Wifi, WifiOff, MapPin, Settings,
} from "lucide-react";

type Direction = "eur-foreign" | "foreign-eur";
interface CurrencyConverterProps { isDark: boolean; }

function CartBadge({ count, primary }: { count: number; primary: string }) {
  const [display, setDisplay] = useState(count);
  const [animClass, setAnimClass] = useState("tabi-badge-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards");
  const [show, setShow] = useState(count > 0);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > 0) {
      setDisplay(count);
      setAnimClass("tabi-badge-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards");
      setShow(true);
    } else if (prevCount.current > 0) {
      setAnimClass("tabi-badge-out 0.22s cubic-bezier(0.4,0,1,1) forwards");
      const t = setTimeout(() => setShow(false), 230);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  if (!show) return null;

  return (
    <span
      className="absolute top-0 right-0 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
      style={{ background: "#fff", color: primary, animation: animClass }}
    >
      {display}
    </span>
  );
}

function InstallPrompt({ onDismiss, language, platform, primary }: { onDismiss: () => void; language: string; platform: "ios" | "android"; primary: string }) {
  const [phase, setPhase] = useState<"hidden" | "in" | "out">("hidden");

  useEffect(() => { const t = requestAnimationFrame(() => setPhase("in")); return () => cancelAnimationFrame(t); }, []);

  function handleDismiss() { setPhase("out"); setTimeout(onDismiss, 420); }

  const isDE = language === "de";
  const isAndroid = platform === "android";
  const isIn = phase === "in";
  const easing = "cubic-bezier(0.22,1,0.36,1)";
  const dur = "0.45s";

  const title = isDE ? "TABI zum Home-Screen hinzufügen" : "Add TABI to your Home Screen";
  const body = isAndroid
    ? isDE
      ? <><span style={{ color: "rgba(255,255,255,0.6)" }}>Tippe oben rechts auf </span><span style={{ color: "#fff", fontWeight: 600 }}>⋮</span><span style={{ color: "rgba(255,255,255,0.6)" }}> dann auf </span><span style={{ color: "#fff", fontWeight: 600 }}>„Zum Startbildschirm"</span></>
      : <><span style={{ color: "rgba(255,255,255,0.6)" }}>Tap </span><span style={{ color: "#fff", fontWeight: 600 }}>⋮</span><span style={{ color: "rgba(255,255,255,0.6)" }}> top right, then </span><span style={{ color: "#fff", fontWeight: 600 }}>"Add to Home Screen"</span></>
    : isDE
      ? <><span style={{ color: "rgba(255,255,255,0.6)" }}>Tippe unten auf </span><span style={{ color: "#fff", fontWeight: 600 }}>Teilen</span><span style={{ color: "rgba(255,255,255,0.6)" }}> dann auf </span><span style={{ color: "#fff", fontWeight: 600 }}>„Zum Home-Bildschirm"</span></>
      : <><span style={{ color: "rgba(255,255,255,0.6)" }}>Tap </span><span style={{ color: "#fff", fontWeight: 600 }}>Share</span><span style={{ color: "rgba(255,255,255,0.6)" }}> then </span><span style={{ color: "#fff", fontWeight: 600 }}>"Add to Home Screen"</span></>;

  if (isAndroid) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-end pt-3 pr-4 pointer-events-none"
        style={{ opacity: isIn ? 1 : 0, transform: isIn ? "translateY(0)" : "translateY(-28px)", transition: `opacity ${dur} ${easing}, transform ${dur} ${easing}` }}>
        <div className="text-white/70 text-xl mb-1 pointer-events-none select-none" style={{ animation: "tabi-bounce-up 1.2s ease-in-out infinite" }}>↑</div>
        <div className="w-full max-w-xs rounded-2xl px-5 py-4 shadow-2xl pointer-events-auto flex items-start gap-3" style={{ background: primary, backdropFilter: "blur(12px)" }}>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-semibold leading-snug">{title}</p>
            <p className="text-[12px] mt-1 leading-snug">{body}</p>
          </div>
          <button onClick={handleDismiss} className="text-white/40 text-lg leading-none flex-shrink-0 mt-0.5 px-1">✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col px-4 pointer-events-none"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)", opacity: isIn ? 1 : 0, transform: isIn ? "translateY(0)" : "translateY(36px)", transition: `opacity ${dur} ${easing}, transform ${dur} ${easing}` }}>
      <div className="w-full rounded-2xl px-5 py-4 shadow-2xl pointer-events-auto flex items-start gap-3" style={{ background: primary, backdropFilter: "blur(12px)" }}>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[13px] font-semibold leading-snug">{title}</p>
          <p className="text-[12px] mt-1 leading-snug">{body}</p>
        </div>
        <button onClick={handleDismiss} className="text-white/40 text-lg leading-none flex-shrink-0 mt-0.5 px-1">✕</button>
      </div>
      <div className="flex justify-end pr-6 mt-1.5 pointer-events-none">
        <span className="text-xl select-none" style={{ color: primary, opacity: 0.8, animation: "tabi-bounce-down 1.2s ease-in-out infinite" }}>↓</span>
      </div>
    </div>
  );
}

function CurrencyConverter({ isDark }: CurrencyConverterProps) {
  const { language, setLanguage } = useLanguage();
  const { currency, config } = useCurrency();
  const { theme, symbol, decimals, taxFreeMin, taxVatRate, taxFreeUnavailable } = config;

  const [provider,     setProvider]     = usePersistentState<Provider>("tabi-provider", "visa");
  const [direction,    setDirection]    = usePersistentState<Direction>("tabi-direction", "foreign-eur");
  const [discountPct,  setDiscountPct]  = usePersistentState<number>("tabi-discount", 0);
  const [taxFree,      setTaxFree]      = usePersistentState<boolean>("tabi-taxfree", false);
  const [showDiscount, setShowDiscount] = usePersistentState<boolean>("tabi-show-discount", false);
  const [showCash,     setShowCash]     = usePersistentState<boolean>("tabi-show-cash", false);
  const [shoppingItems, setShoppingItems] = usePersistentState<ShoppingItem[]>("tabi-shopping-list", []);

  const [cashBudget, setCashBudget] = useState<string>(() => lsGet(`tabi-cash-budget-${currency}`, ""));
  const [cashSpent,  setCashSpent]  = useState<number>(() => lsGet(`tabi-cash-spent-${currency}`, 0));
  const [manualRate, setManualRate] = useState<number | null>(() => lsGet(`tabi-manual-rate-${currency}`, null));

  const [inputValue,  setInputValue]  = useState<string>("");
  const [baseRate,    setBaseRate]    = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoading,   setIsLoading]   = useState<boolean>(true);
  const [isOffline,   setIsOffline]   = useState<boolean>(false);
  const [isListOpen,  setIsListOpen]  = useState(false);
  const [switchPressed, setSwitchPressed] = useState(false);
  const [showSettings,    setShowSettings]    = useState(false);
  const [showTaxFreeInfo, setShowTaxFreeInfo] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [installPlatform, setInstallPlatform] = useState<"ios" | "android">("ios");
  const cashSectionRef = useRef<HTMLDivElement>(null);
  const cashMountedRef = useRef(false);

  const TICKER_PROVIDERS = [
    { label: "Mastercard", divisor: 1.0045 },
    { label: "Visa",        divisor: 1.0055 },
    { label: "Amex",        divisor: 1.025  },
  ] as const;
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerKey,   setTickerKey]   = useState(0);

  useEffect(() => {
    setInputValue("");
    setManualRate(lsGet(`tabi-manual-rate-${currency}`, null));
    setCashBudget(lsGet(`tabi-cash-budget-${currency}`, ""));
    setCashSpent(lsGet(`tabi-cash-spent-${currency}`, 0));
    const cached = getCachedRate(currency);
    if (cached) { setBaseRate(cached.rate); setLastUpdated(cached.timestamp); setIsLoading(false); }
    else { setIsLoading(true); }
    fetchExchangeRate(currency).then(fresh => {
      if (fresh) { setBaseRate(fresh.rate); setLastUpdated(fresh.timestamp); setIsOffline(false); }
      else { setIsOffline(true); }
      setIsLoading(false);
    });
  }, [currency]);

  useEffect(() => {
    lsSet(`tabi-cash-budget-${currency}`, cashBudget);
  }, [cashBudget, currency]);
  useEffect(() => {
    lsSet(`tabi-cash-spent-${currency}`, cashSpent);
  }, [cashSpent, currency]);
  useEffect(() => {
    lsSet(`tabi-manual-rate-${currency}`, manualRate);
  }, [manualRate, currency]);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isStandalone = (window.navigator as any).standalone === true || window.matchMedia("(display-mode: standalone)").matches;
    const hasShown = localStorage.getItem("tabi-ios-prompt-shown");
    if (!isStandalone && !hasShown && (isIOS || isAndroid)) {
      setInstallPlatform(isAndroid ? "android" : "ios");
      const t = setTimeout(() => setShowIOSPrompt(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!cashMountedRef.current) { cashMountedRef.current = true; return; }
    if (showCash && cashSectionRef.current) {
      setTimeout(() => cashSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 320);
    }
  }, [showCash]);

  useEffect(() => {
    const id = setInterval(() => { setTickerIndex(i => (i + 1) % 3); setTickerKey(k => k + 1); }, 5000);
    return () => clearInterval(id);
  }, []);

  function dismissIOSPrompt() { localStorage.setItem("tabi-ios-prompt-shown", "1"); setShowIOSPrompt(false); }

  function getAdjustedRate(): number {
    const r = manualRate !== null ? manualRate : baseRate;
    if (!r) return 0;
    if (manualRate !== null) return manualRate;
    if (provider === "mastercard") return r / 1.0045;
    if (provider === "visa")       return r / 1.0055;
    return r / 1.025;
  }

  const isIntegerMode = direction === "foreign-eur" && decimals === 0;

  function effectiveInputAmount(): number {
    const raw = isIntegerMode
      ? parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0
      : parseFloat(inputValue.replace(",", ".")) || 0;
    return raw * (1 - discountPct / 100);
  }

  function calculateConversion(): number {
    const rate = getAdjustedRate();
    if (!rate) return 0;
    const amount = effectiveInputAmount();
    const converted = direction === "eur-foreign" ? amount * rate : amount / rate;
    return taxFree && taxFreeMin && taxVatRate ? converted / (1 + taxVatRate) : converted;
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    if (!isIntegerMode) {
      value = value.replace(".", ",");
      if (value === "" || /^[0-9]+,?[0-9]{0,2}$/.test(value)) setInputValue(value);
    } else {
      value = value.replace(/\./g, "");
      if (value === "" || /^[0-9]*$/.test(value)) {
        const fmt = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setInputValue(fmt || value);
      }
    }
  }

  function handleAddToList() {
    const inputAmount = parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;
    if (inputAmount === 0) return;
    const rate = getAdjustedRate();
    const eff  = effectiveInputAmount();
    const amountForeign = direction === "foreign-eur" ? eff : eff * rate;
    const amountEUR     = direction === "foreign-eur" ? eff / rate : eff;
    setShoppingItems(prev => [...prev, { id: Date.now().toString(), amountForeign, currencyCode: currency, amountEUR, timestamp: Date.now() }]);
    setInputValue("");
  }

  function handleSpendCash() {
    const rate = getAdjustedRate();
    const foreignAmount = direction === "eur-foreign" ? result : result * rate;
    setCashSpent(prev => prev + foreignAmount);
  }

  function handleSwitchDirection() {
    setSwitchPressed(true);
    setDirection(d => d === "eur-foreign" ? "foreign-eur" : "eur-foreign");
    setInputValue("");
    setTimeout(() => setSwitchPressed(false), 160);
  }

  const cashBudgetNum = parseFloat(cashBudget.replace(/\./g, "").replace(",", ".")) || 0;
  const cashRemaining = cashBudgetNum - cashSpent;
  const overBudget    = cashRemaining < 0;
  const result        = calculateConversion();
  const inputCurrency  = direction === "eur-foreign" ? "EUR" : currency;
  const outputCurrency = direction === "eur-foreign" ? currency : "EUR";
  const currentForeign = direction === "foreign-eur" ? effectiveInputAmount() : result;
  const taxFreeEligible = taxFreeMin ? currentForeign >= taxFreeMin : false;

  const DISCOUNT_PRESETS = [0, 10, 20, 30, 50, 70];
  const atmLink = "https://www.google.com/maps/search/ATM";

  return (
    <div className="flex flex-col min-h-screen" style={{ background: theme.bg }}>

      <div style={{ background: theme.primary, paddingTop: "env(safe-area-inset-top)" }} className="flex-shrink-0 z-50 shadow-md relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: "env(safe-area-inset-top, 44px)",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)",
            zIndex: 10,
          }}
        />
        <div className="flex items-center justify-between px-4 h-20">

          <div className="w-12 flex-shrink-0">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl transition-colors"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 flex justify-center items-center h-full px-2">
            <img
              src="/tabi-logo-horizontal.svg" alt="TABI Currency Converter"
              className="h-full max-h-[60px] w-auto object-contain select-none"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
              draggable={false}
            />
          </div>

          <div className="w-12 flex justify-end flex-shrink-0">
            <button onClick={() => setIsListOpen(true)} className="relative p-2 transition-colors" style={{ color: "rgba(255,255,255,0.6)" }}>
              <ShoppingCart className="h-6 w-6" />
              <CartBadge count={shoppingItems.length} primary={theme.primary} />
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes tabi-ticker-in { from { transform: translateY(55%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .tabi-ticker-in { animation: tabi-ticker-in 0.6s ease-out forwards; }
        @keyframes tabi-badge-pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.4); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes tabi-badge-out { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0); opacity: 0; } }
        @keyframes tabi-bounce-down { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
        @keyframes tabi-bounce-up   { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        input[type=range] { -webkit-appearance: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; background: ${theme.primary}; }
        input[type=range]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; cursor: pointer; border: none; background: ${theme.primary}; }
      `}</style>

      <div className="flex items-center justify-between px-4 py-1.5" style={{ background: theme.bgAccent, borderBottom: `1px solid ${theme.border}` }}>
        {baseRate ? (
          <div style={{ overflow: "hidden", height: "16px", position: "relative", minWidth: 0, flex: 1 }}>
            <div key={tickerKey} className="tabi-ticker-in flex items-baseline gap-2">
              {(() => {
                const rates  = TICKER_PROVIDERS.map(p => baseRate / p.divisor);
                const best   = Math.max(...rates);
                const worst  = Math.min(...rates);
                const today  = rates[tickerIndex];
                const color  = today === best ? "#4A7C6F" : today === worst ? "#C0503A" : "#1A1A1A";
                const label  = TICKER_PROVIDERS[tickerIndex].label;
                return (
                  <>
                    <span className="font-semibold tracking-widest uppercase whitespace-nowrap" style={{ color: theme.textMuted, fontSize: "10px" }}>{label}</span>
                    <span className="font-medium whitespace-nowrap" style={{ color, fontSize: "10px" }}>
                      {today.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}{" "}{currency === "CHF" ? <ChfSymbol /> : symbol}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <span className="text-[10px] tracking-widest uppercase" style={{ color: theme.textSubtle }}>--</span>
        )}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
          {isOffline ? <WifiOff className="h-3 w-3" style={{ color: "#C57A5A" }} /> : <Wifi className="h-3 w-3" style={{ color: theme.textSubtle }} />}
          <p className="text-[10px] tracking-widest uppercase" style={{ color: isOffline ? "#C57A5A" : theme.textSubtle }}>
            {isOffline ? "Offline" : isLoading ? getTranslation(language, "loading") : lastUpdated ? `${getTranslation(language, "updated")}: ${lastUpdated}` : "--"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}>

        <ProviderToggle provider={provider} onProviderChange={setProvider} isDark={isDark} language={language} />

        <div className="space-y-2">
          <label className="block text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
            {getTranslation(language, "amountIn")} {inputCurrency === "EUR" ? "EUR" : currency}
          </label>
          <div className="relative">
            <Input
              type="text" inputMode="decimal" value={inputValue} onChange={handleInputChange}
              placeholder={isIntegerMode ? "0" : "0,00"}
              className="text-3xl h-14 rounded-xl bg-white text-[#1A1A1A] placeholder:text-[#C5BFB3] transition-all"
              style={{
                border: `1px solid ${theme.border}`,
                paddingLeft: inputCurrency !== "EUR" && config.symbolBefore ? "2.5rem" : "1rem",
                paddingRight: inputCurrency === "EUR" || !config.symbolBefore ? "2.5rem" : "1rem",
              }}
              disabled={isLoading}
            />
            <span
              className="absolute top-1/2 -translate-y-1/2 text-lg font-medium"
              style={{
                color: theme.textSubtle,
                left: inputCurrency !== "EUR" && config.symbolBefore ? "1rem" : undefined,
                right: inputCurrency === "EUR" || !config.symbolBefore ? "1rem" : undefined,
              }}
            >
              {inputCurrency === "EUR" ? "€" : (currency === "CHF" ? <ChfSymbol /> : symbol)}
            </span>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.border}`, background: theme.bgCard }}>
          <button onClick={() => setShowDiscount(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-left">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" style={{ color: theme.textMuted }} />
              <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                {language === "de" ? "Rabatt" : "Discount"}
              </span>
              {discountPct > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: theme.primary }}>
                  -{discountPct}%
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 transition-transform duration-300" style={{ color: theme.textSubtle, transform: showDiscount ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>

          <div style={{ display: "grid", gridTemplateRows: showDiscount ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}>
          <div style={{ overflow: "hidden" }}>
          <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${theme.borderLight}` }}>
            <div className="pt-3 flex flex-wrap gap-2">
              {DISCOUNT_PRESETS.map(pct => (
                <button
                  key={pct}
                  onClick={() => setDiscountPct(pct)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                  style={{
                    background: discountPct === pct ? theme.primary : theme.bgInput,
                    color: discountPct === pct ? "#fff" : theme.textMuted,
                    borderColor: discountPct === pct ? theme.primary : theme.border,
                  }}
                >
                  {pct === 0 ? (language === "de" ? "Kein Rabatt" : "No discount") : pct === 50 && currency === "JPY" ? "半額 50%" : `-${pct}%`}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] uppercase tracking-widest" style={{ color: theme.textMuted }}>{language === "de" ? "Individuell" : "Custom"}</span>
                <span className="text-sm font-semibold" style={{ color: theme.primary }}>{discountPct}%</span>
              </div>
              <input
                type="range" min={0} max={70} step={1} value={discountPct}
                onChange={e => setDiscountPct(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${theme.primary} ${discountPct / 70 * 100}%, ${theme.border} ${discountPct / 70 * 100}%)` }}
              />
            </div>
            {discountPct > 0 && inputValue && effectiveInputAmount() > 0 && (
              <div className="rounded-lg px-3 py-2 flex justify-between items-center" style={{ background: theme.bgAccent }}>
                <span className="text-[11px] uppercase tracking-widest" style={{ color: theme.textMuted }}>{getTranslation(language, "effectiveAmount")}</span>
                <span className="text-sm font-semibold" style={{ color: theme.primary }}>
                  {isIntegerMode
                    ? formatCurrency(effectiveInputAmount(), currency)
                    : (direction === "foreign-eur"
                        ? formatCurrency(effectiveInputAmount(), currency)
                        : effectiveInputAmount().toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €")}
                </span>
              </div>
            )}
          </div>
          </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden -mx-2" style={{ background: theme.bgCard, border: `1px solid ${theme.border}` }}>
          <div className="px-5 py-5 text-center" style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
            <ConversionDisplay result={result} currency={outputCurrency as any} isLoading={isLoading} isDark={isDark}>
              <ExchangeRateDisplay rate={getAdjustedRate()} isManual={manualRate !== null} onManualRateChange={setManualRate} isDark={isDark} language={language} />
            </ConversionDisplay>
          </div>

          {(taxFreeMin || taxFreeUnavailable) && (() => {
            const vatLabel = taxVatRate ? `${Math.round(taxVatRate * 100)}%` : "";
            const deductLabel = language === "de"
              ? `${vatLabel} MwSt. abziehen (Flughafen-Erstattung)`
              : `Deduct ${vatLabel} VAT (airport refund)`;

            if (taxFreeUnavailable) {
              return (
                <div className="w-full flex items-start gap-3 px-4 py-3" style={{ background: theme.bgInput, borderTop: `1px solid ${theme.borderLight}` }}>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>Tax Free</span>
                      <button onClick={() => setShowTaxFreeInfo(true)} className="flex items-center justify-center" style={{ color: theme.textSubtle }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <circle cx="10" cy="6.5" r="0.75" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                    <span className="text-[10px] mt-0.5 leading-relaxed" style={{ color: theme.textSubtle }}>
                      {language === "de" ? taxFreeUnavailable.de : taxFreeUnavailable.en}
                    </span>
                  </div>
                </div>
              );
            }

            const minLabel = language === "de"
              ? `Mindestbetrag: ${formatCurrency(taxFreeMin!, currency)} (2026)`
              : `Min. amount: ${formatCurrency(taxFreeMin!, currency)} (2026)`;

            return (
              <button
                onClick={() => { if (taxFreeEligible) setTaxFree(v => !v); }}
                className="w-full flex items-center justify-between px-4 py-3 transition-colors"
                style={{
                  background: !taxFreeEligible ? theme.bgInput : taxFree ? theme.primary : theme.bgCard,
                  opacity: !taxFreeEligible ? 0.6 : 1,
                  cursor: !taxFreeEligible ? "not-allowed" : "pointer",
                }}
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: taxFree && taxFreeEligible ? "#fff" : theme.textMuted }}>Tax Free</span>
                    <button
                      onClick={e => { e.stopPropagation(); setShowTaxFreeInfo(true); }}
                      className="flex items-center justify-center"
                      style={{ color: taxFree && taxFreeEligible ? "rgba(255,255,255,0.6)" : theme.textSubtle }}
                    >
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="10" cy="6.5" r="0.75" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                  <span className="text-[10px]" style={{ color: taxFree && taxFreeEligible ? "rgba(255,255,255,0.6)" : theme.textSubtle }}>
                    {taxFreeEligible ? deductLabel : minLabel}
                  </span>
                </div>
                {taxFreeEligible && (
                  <div className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0" style={{ background: taxFree ? "rgba(255,255,255,0.3)" : theme.border }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all shadow-sm" style={{ left: taxFree ? "calc(100% - 18px)" : "2px", background: taxFree ? "#fff" : theme.bgCard }} />
                  </div>
                )}
              </button>
            );
          })()}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShoppingItems(prev => prev.slice(0, -1))}
            disabled={shoppingItems.length === 0}
            className="flex-1 h-12 rounded-xl font-medium text-sm border transition-all active:scale-95"
            style={{
              background: theme.bgCard,
              borderColor: shoppingItems.length === 0 ? theme.borderLight : theme.primary,
              color: shoppingItems.length === 0 ? theme.textSubtle : theme.primary,
              opacity: shoppingItems.length === 0 ? 0.5 : 1,
            }}
          >
            <Minus className="h-4 w-4 mx-auto" />
          </button>
          <button
            onClick={handleAddToList}
            disabled={!inputValue || parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) === 0}
            className="flex-1 h-12 rounded-xl font-medium text-sm border text-white active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: theme.primary, borderColor: theme.primary }}
          >
            <Plus className="h-4 w-4 mx-auto" />
          </button>
        </div>

        <button
          onClick={handleSwitchDirection}
          className="w-full h-12 rounded-xl font-semibold text-sm tracking-widest uppercase flex items-center justify-center gap-2 select-none"
          style={{
            WebkitTapHighlightColor: "transparent",
            background: switchPressed ? theme.bgAccent : theme.bgCard,
            border: `1px solid ${theme.border}`,
            color: theme.primary,
            transform: switchPressed ? "scale(0.97)" : "scale(1)",
            transition: switchPressed ? "none" : "background-color 0.25s ease, transform 0.25s ease",
          }}
        >
          <span style={{ display: "inline-flex", transition: "transform 0.3s ease", transform: direction === "eur-foreign" ? "rotate(0deg)" : "rotate(180deg)" }}>
            <ArrowUp className="h-4 w-4" /><ArrowDown className="h-4 w-4" />
          </span>
          {getTranslation(language, "switchDirection")}
        </button>

        <div ref={cashSectionRef} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.border}`, background: theme.bgCard }}>
          <button onClick={() => setShowCash(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-left">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" style={{ color: theme.textMuted }} />
              <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                {language === "de" ? "Bargeld-Tracker" : "Cash Tracker"}
              </span>
              {cashBudgetNum > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                  background: overBudget ? "#F5E8E8" : theme.bgAccent,
                  color: overBudget ? "#9E3A3A" : theme.primary,
                }}>
                  {overBudget ? (language === "de" ? "Limit!" : "Over!") : formatCurrency(cashRemaining, currency)}
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 transition-transform duration-300" style={{ color: theme.textSubtle, transform: showCash ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>

          <div style={{ display: "grid", gridTemplateRows: showCash ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}>
          <div style={{ overflow: "hidden" }}>
          <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop: `1px solid ${theme.borderLight}` }}>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                  Budget ({currency})
                </label>
                <a href={atmLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold hover:underline" style={{ color: theme.primary }}>
                  <MapPin className="h-3 w-3" />
                  {getTranslation(language, "findAtm")}
                </a>
              </div>
              <div className="relative">
                <Input
                  type="text" inputMode="numeric" value={cashBudget}
                  onChange={e => {
                    const v = e.target.value.replace(/\./g, "");
                    if (v === "" || /^[0-9]+$/.test(v)) setCashBudget(v.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
                  }}
                  placeholder="0"
                  className="h-11 rounded-xl text-[#1A1A1A] px-4 text-lg"
                  style={{ border: `1px solid ${theme.border}`, background: theme.bgInput }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: theme.textSubtle }}>{currency === "CHF" ? <ChfSymbol /> : symbol}</span>
              </div>
            </div>

            {cashBudgetNum > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] uppercase tracking-widest" style={{ color: theme.textMuted }}>
                  <span>{getTranslation(language, "spent")}</span>
                  <span>{formatCurrency(cashSpent, currency)}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: theme.borderLight }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.max(0, Math.min(100, (cashRemaining / cashBudgetNum) * 100))}%`,
                    background: overBudget ? "#9E3A3A" : theme.primary,
                    transition: "width 0.6s cubic-bezier(0.4,0,0.2,1), background 0.4s ease",
                  }} />
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-widest">
                  <span style={{ color: theme.textMuted }}>{getTranslation(language, "remaining")}</span>
                  <span className="font-semibold" style={{ color: overBudget ? "#9E3A3A" : theme.primary }}>
                    {overBudget ? "-" : ""}{formatCurrency(Math.abs(cashRemaining), currency)}
                  </span>
                </div>
                {overBudget && (
                  <div className="rounded-xl px-4 py-3 space-y-1" style={{ background: "#FAF0F0", border: "1px solid #E8CECE" }}>
                    <p className="text-xs font-semibold" style={{ color: "#8B3030" }}>{language === "de" ? "Bargeld reicht nicht!" : "Insufficient cash!"}</p>
                    <p className="text-[11px]" style={{ color: "#9E3A3A" }}>
                      {language === "de"
                        ? `Du hast ${formatCurrency(Math.abs(cashRemaining), currency)} mehr ausgegeben als dein Budget.`
                        : `You've spent ${formatCurrency(Math.abs(cashRemaining), currency)} over budget.`}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSpendCash}
                disabled={result === 0 || cashBudgetNum === 0}
                className="flex-1 h-10 rounded-xl text-white text-xs font-semibold tracking-wide transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: theme.primary }}
              >
                {getTranslation(language, "spend")}{result > 0 && direction === "eur-foreign" ? ` (${formatCurrency(result, currency)})` : ""}
              </button>
              <button
                onClick={() => setCashSpent(0)}
                disabled={cashSpent === 0}
                className="px-4 h-10 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ border: `1px solid ${theme.border}`, color: theme.textMuted, background: theme.bgInput }}
              >
                {getTranslation(language, "reset")}
              </button>
            </div>
          </div>
          </div>
          </div>
        </div>
      </div>

      <ShoppingList
        items={shoppingItems} isOpen={isListOpen} onClose={() => setIsListOpen(false)}
        onRemoveItem={id => setShoppingItems(prev => prev.filter(i => i.id !== id))}
        onUpdateItemName={(id, name) => setShoppingItems(prev => prev.map(i => i.id === id ? { ...i, name } : i))}
        onClear={() => setShoppingItems([])} isDark={isDark} taxMode="netto" language={language}
      />

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} language={language} onLanguageChange={setLanguage} />
      <TaxFreeInfoModal isOpen={showTaxFreeInfo} onClose={() => setShowTaxFreeInfo(false)} language={language} />

      {showIOSPrompt && <InstallPrompt onDismiss={dismissIOSPrompt} language={language} platform={installPlatform} primary={theme.primary} />}
    </div>
  );
}

export default CurrencyConverter;
