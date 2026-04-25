import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import ProviderToggle, { type Provider } from "./ProviderToggle";
import ConversionDisplay from "./ConversionDisplay";
import ExchangeRateDisplay from "./ExchangeRateDisplay";
import ShoppingList, { type ShoppingItem } from "./ShoppingList";
import SettingsModal from "./SettingsModal";
import { fetchExchangeRate, getCachedRate } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../lib/translations";
import { usePersistentState } from "../lib/storage";
import { CURRENCIES } from "../lib/currencies";
import type { ForeignCurrency } from "../lib/currencies";
import { formatCurrency } from "../lib/formatter";
import {
  ShoppingCart, Plus, Minus, ArrowUp, ArrowDown,
  Tag, Wallet, ChevronDown, Wifi, WifiOff, MapPin, Settings,
} from "lucide-react";

type Direction = "eur-foreign" | "foreign-eur";

interface CurrencyConverterProps {
  currency: ForeignCurrency;
  onCurrencyChange: (c: ForeignCurrency) => void;
  isDark: boolean;
}

const DISCOUNT_PRESETS = [0, 10, 20, 30, 50, 70];
const TAX_FREE_MIN_JPY = 5500;

function InstallPrompt({ onDismiss, language, platform }: { onDismiss: () => void; language: string; platform: "ios" | "android" }) {
  const [phase, setPhase] = useState<"hidden" | "in" | "out">("hidden");

  useEffect(() => {
    const t = requestAnimationFrame(() => setPhase("in"));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleDismiss() {
    setPhase("out");
    setTimeout(onDismiss, 420);
  }

  const isDE = language === "de";
  const isAndroid = platform === "android";

  const title = isDE ? "Tabi zum Home-Screen hinzufügen" : "Add Tabi to your Home Screen";
  const body = isAndroid
    ? isDE
      ? <>Tippe oben rechts auf <span className="text-white font-semibold">⋮</span> dann auf <span className="text-white font-semibold">„Zum Startbildschirm"</span></>
      : <>Tap <span className="text-white font-semibold">⋮</span> top right, then <span className="text-white font-semibold">"Add to Home Screen"</span></>
    : isDE
      ? <>Tippe unten auf <span className="text-white font-semibold">Teilen</span> dann auf <span className="text-white font-semibold">„Zum Home-Bildschirm"</span></>
      : <>Tap <span className="text-white font-semibold">Share</span> then <span className="text-white font-semibold">"Add to Home Screen"</span></>;

  const isIn = phase === "in";
  const easing = "cubic-bezier(0.22,1,0.36,1)";
  const dur = "0.45s";

  if (isAndroid) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-50 flex flex-col items-end pt-3 pr-4 pointer-events-none"
        style={{
          opacity: isIn ? 1 : 0,
          transform: isIn ? "translateY(0)" : "translateY(-28px)",
          transition: `opacity ${dur} ${easing}, transform ${dur} ${easing}`,
        }}
      >
        <div className="text-white/70 text-xl mb-1 pointer-events-none select-none" style={{ animation: "tabi-bounce-up 1.2s ease-in-out infinite" }}>↑</div>
        <div
          className="w-full max-w-xs rounded-2xl px-5 py-4 shadow-2xl pointer-events-auto flex items-start gap-3"
          style={{ backgroundColor: "#1B2A4A", backdropFilter: "blur(12px)" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-semibold leading-snug">{title}</p>
            <p className="text-white/60 text-[12px] mt-1 leading-snug">{body}</p>
          </div>
          <button onClick={handleDismiss} className="text-white/40 text-lg leading-none flex-shrink-0 mt-0.5 px-1">✕</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col px-4 pointer-events-none"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)",
        opacity: isIn ? 1 : 0,
        transform: isIn ? "translateY(0)" : "translateY(36px)",
        transition: `opacity ${dur} ${easing}, transform ${dur} ${easing}`,
      }}
    >
      <div
        className="w-full rounded-2xl px-5 py-4 shadow-2xl pointer-events-auto flex items-start gap-3"
        style={{ backgroundColor: "#1B2A4A", backdropFilter: "blur(12px)" }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-white text-[13px] font-semibold leading-snug">{title}</p>
          <p className="text-white/60 text-[12px] mt-1 leading-snug">{body}</p>
        </div>
        <button onClick={handleDismiss} className="text-white/40 text-lg leading-none flex-shrink-0 mt-0.5 px-1">✕</button>
      </div>
      <div className="flex justify-end pr-6 mt-1.5 pointer-events-none">
        <span className="text-white/70 text-xl select-none" style={{ animation: "tabi-bounce-down 1.2s ease-in-out infinite" }}>↓</span>
      </div>
    </div>
  );
}

function CartBadge({ count }: { count: number }) {
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
      className="absolute top-0 right-0 bg-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
      style={{ animation: animClass, color: "#1B2A4A" }}
    >
      {display}
    </span>
  );
}

function CurrencyConverter({ currency, onCurrencyChange, isDark }: CurrencyConverterProps) {
  const { language, setLanguage } = useLanguage();
  const config = CURRENCIES[currency];
  const theme = config.theme;

  const [provider,      setProvider]      = usePersistentState<Provider>("tabi-provider",       "visa");
  const [direction,     setDirection]     = usePersistentState<Direction>("tabi-direction-v2",  "foreign-eur");
  const [discountPct,   setDiscountPct]   = usePersistentState<number>  ("tabi-discount",        0);
  const [taxFree,       setTaxFree]       = usePersistentState<boolean> ("tabi-taxfree",         false);
  const [showDiscount,  setShowDiscount]  = usePersistentState<boolean> ("tabi-show-discount",  false);
  const [showCash,      setShowCash]      = usePersistentState<boolean> ("tabi-show-cash",       false);
  const [cashBudget,    setCashBudget]    = usePersistentState<string>  (`tabi-cash-budget-${currency}`, "");
  const [cashSpent,     setCashSpent]     = usePersistentState<number>  (`tabi-cash-spent-${currency}`,   0);

  const [shoppingItems, setShoppingItems] = usePersistentState<ShoppingItem[]>(
    `tabi-shopping-${currency}`, [],
  );

  const [inputValue,    setInputValue]    = useState<string>("");
  const [baseRate,      setBaseRate]      = useState<number | null>(null);
  const [manualRate,    setManualRate]    = useState<number | null>(null);
  const [lastUpdated,   setLastUpdated]   = useState<string>("");
  const [isLoading,     setIsLoading]     = useState<boolean>(true);
  const [isOffline,     setIsOffline]     = useState<boolean>(false);
  const [isListOpen,    setIsListOpen]    = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [switchPressed, setSwitchPressed] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [installPlatform, setInstallPlatform] = useState<"ios" | "android">("ios");
  const cashSectionRef = useRef<HTMLDivElement>(null);
  const cashMountedRef = useRef(false);

  const TICKER_PROVIDERS = [
    { label: "Mastercard", divisor: 1.0045 },
    { label: "Visa",        divisor: 1.0055 },
    { label: "American Express", divisor: 1.025  },
  ] as const;
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerKey,   setTickerKey]   = useState(0);

  useEffect(() => { loadExchangeRate(); }, []);

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
    if (!cashMountedRef.current) {
      cashMountedRef.current = true;
      return;
    }
    if (showCash && cashSectionRef.current) {
      setTimeout(() => {
        cashSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 320);
    }
  }, [showCash]);

  useEffect(() => {
    const id = setInterval(() => {
      setTickerIndex(i => (i + 1) % 3);
      setTickerKey(k => k + 1);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  async function loadExchangeRate() {
    const cached = getCachedRate(currency);
    if (cached) {
      setBaseRate(cached.rate);
      setLastUpdated(cached.timestamp);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    const fresh = await fetchExchangeRate(currency);
    if (fresh) {
      setBaseRate(fresh.rate);
      setLastUpdated(fresh.timestamp);
      setIsOffline(false);
    } else {
      setIsOffline(true);
    }
    setIsLoading(false);
  }

  function dismissIOSPrompt() {
    localStorage.setItem("tabi-ios-prompt-shown", "1");
    setShowIOSPrompt(false);
  }

  function getAdjustedRate(): number {
    const r = manualRate !== null ? manualRate : baseRate;
    if (!r) return 0;
    if (manualRate !== null) return manualRate;
    if (provider === "mastercard") return r / 1.0045;
    if (provider === "visa")       return r / 1.0055;
    return r / 1.025;
  }

  function effectiveInputAmount(): number {
    let raw: number;
    if (direction === "eur-foreign") {
      raw = parseFloat(inputValue.replace(",", ".")) || 0;
    } else if (config.decimals === 0) {
      raw = parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;
    } else {
      raw = parseFloat(inputValue.replace(",", ".")) || 0;
    }
    return raw * (1 - discountPct / 100);
  }

  function calculateConversion(): number {
    const rate = getAdjustedRate();
    if (!rate) return 0;
    const amount = effectiveInputAmount();
    const converted = direction === "eur-foreign" ? amount * rate : amount / rate;
    return config.isJapan && taxFree ? converted / 1.1 : converted;
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    if (direction === "eur-foreign") {
      value = value.replace(".", ",");
      if (value === "" || /^[0-9]+,?[0-9]{0,2}$/.test(value)) setInputValue(value);
    } else if (config.decimals === 0) {
      value = value.replace(/\./g, "");
      if (value === "" || /^[0-9,]*$/.test(value)) {
        const fmt = value.replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setInputValue(fmt || value);
      }
    } else {
      value = value.replace(".", ",");
      if (value === "" || /^[0-9]+,?[0-9]{0,2}$/.test(value)) setInputValue(value);
    }
  }

  function handleAddToList() {
    const inputAmount = effectiveInputAmount() / (1 - discountPct / 100) || 0;
    if (inputAmount === 0) return;
    const rate = getAdjustedRate();
    const eff = effectiveInputAmount();
    const amountForeign = direction === "foreign-eur" ? eff : eff * rate;
    const amountEUR = direction === "foreign-eur" ? eff / rate : eff;
    setShoppingItems(prev => [...prev, {
      id: Date.now().toString(),
      amountForeign,
      amountEUR,
      currency,
      timestamp: Date.now(),
    }]);
    setInputValue("");
  }

  const cashBudgetNum = parseFloat(cashBudget.replace(/\./g, "").replace(",", ".")) || 0;
  const cashRemaining = cashBudgetNum - cashSpent;
  const overBudget    = cashRemaining < 0;
  const result        = calculateConversion();

  const inputCurrencyLabel  = direction === "eur-foreign" ? "EUR" : currency;
  const outputCurrencyLabel = direction === "eur-foreign" ? currency : "EUR";

  const currentForeign = direction === "foreign-eur" ? effectiveInputAmount() : result;
  const taxFreeEligible = config.isJapan && currentForeign >= TAX_FREE_MIN_JPY;

  function handleSpendCash() {
    const rate = getAdjustedRate();
    const foreignAmount = outputCurrencyLabel === currency ? result : result * rate;
    setCashSpent(prev => prev + foreignAmount);
  }

  function formatForeign(n: number) {
    return formatCurrency(n, currency);
  }

  function handleSwitchDirection() {
    setSwitchPressed(true);
    setDirection(d => d === "eur-foreign" ? "foreign-eur" : "eur-foreign");
    setTimeout(() => setSwitchPressed(false), 160);
    setInputValue("");
  }

  const atmLink = "https://www.google.com/maps/search/ATM";

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: theme.bg }}>

      <div
        className="text-white flex-shrink-0 z-50 shadow-md"
        style={{ backgroundColor: theme.primary, paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between px-4 h-20">

          <div className="w-12 flex-shrink-0">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-white/60 hover:text-white p-2 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 flex justify-center items-center h-full px-2">
            <img
              src="/tabi-logo-horizontal.svg"
              alt="Tabi Currency Converter"
              className="h-full max-h-[60px] w-auto object-contain select-none transition-all"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
              draggable={false}
            />
          </div>

          <div className="w-12 flex justify-end flex-shrink-0">
            <button onClick={() => setIsListOpen(true)} className="relative p-2 text-white/60 hover:text-white transition-colors">
              <ShoppingCart className="h-6 w-6" />
              <CartBadge count={shoppingItems.length} />
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes tabi-ticker-in {
          from { transform: translateY(55%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        .tabi-ticker-in {
          animation: tabi-ticker-in 0.6s ease-out forwards;
        }
        @keyframes tabi-bounce-down {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(5px); }
        }
        @keyframes tabi-bounce-up {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes tabi-badge-pop {
          0%   { transform: scale(0);   opacity: 0; }
          60%  { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes tabi-badge-out {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
      `}</style>

      <div
        className="flex items-center justify-between px-4 py-1.5 border-b"
        style={{ backgroundColor: theme.bgAlt, borderColor: theme.border }}
      >
        {baseRate ? (
          <div style={{ overflow: "hidden", height: "16px", position: "relative", minWidth: 0, flex: 1 }}>
            <div key={tickerKey} className="tabi-ticker-in flex items-baseline gap-2">
              {(() => {
                const rates = TICKER_PROVIDERS.map(p => baseRate / p.divisor);
                const best  = Math.max(...rates);
                const worst = Math.min(...rates);
                const today = rates[tickerIndex];
                const color = today === best ? "#4A7C6F" : today === worst ? "#C0503A" : "#1A1A1A";
                const label = TICKER_PROVIDERS[tickerIndex].label;

                return (
                  <>
                    <span
                      className="font-semibold tracking-widest uppercase whitespace-nowrap"
                      style={{ color: theme.textMuted, fontSize: "10px" }}
                    >
                      {label}
                    </span>
                    <span className="font-medium whitespace-nowrap" style={{ color, fontSize: "10px" }}>
                      {today.toLocaleString("de-DE", { minimumFractionDigits: config.decimals > 0 ? 4 : 2, maximumFractionDigits: config.decimals > 0 ? 4 : 2 })} {config.symbol}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <span className="text-[10px] tracking-widest uppercase" style={{ color: theme.textFaint }}>--</span>
        )}

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
          {isOffline
            ? <WifiOff className="h-3 w-3" style={{ color: "#C57A5A" }} />
            : <Wifi    className="h-3 w-3" style={{ color: theme.textFaint }} />}
          <p className="text-[10px] tracking-widest uppercase" style={{ color: isOffline ? "#C57A5A" : theme.textFaint }}>
            {isOffline
              ? "Offline"
              : isLoading
                ? getTranslation(language, "loading")
                : lastUpdated
                  ? `${getTranslation(language, "updated")}: ${lastUpdated}`
                  : "--"}
          </p>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
      >
        <ProviderToggle provider={provider} onProviderChange={setProvider} isDark={isDark} language={language} theme={theme} />

        <div className="space-y-2">
          <label className="block text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
            {getTranslation(language, "amountIn")} {inputCurrencyLabel}
          </label>
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={direction === "eur-foreign" ? "0,00" : (config.decimals === 0 ? "0" : "0,00")}
              className="text-3xl h-14 rounded-xl bg-white text-[#1A1A1A] placeholder:text-[#C5BFB3] transition-all px-4"
              style={{ border: `1px solid ${theme.border}` }}
              disabled={isLoading}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium" style={{ color: theme.textFaint }}>
              {inputCurrencyLabel === "EUR" ? "€" : config.symbol}
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: theme.border }}>
          <button
            onClick={() => setShowDiscount(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" style={{ color: theme.textMuted }} />
              <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                {language === "de" ? "Rabatt" : "Discount"}
              </span>
              {discountPct > 0 && (
                <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.primary }}>
                  -{discountPct}%
                </span>
              )}
            </div>
            <ChevronDown
              className="h-4 w-4 transition-transform duration-300"
              style={{ color: theme.textFaint, transform: showDiscount ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <div style={{ display: "grid", gridTemplateRows: showDiscount ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}>
            <div style={{ overflow: "hidden" }}>
              <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${theme.borderAlt}` }}>
                <div className="pt-3 flex flex-wrap gap-2">
                  {DISCOUNT_PRESETS.map(pct => (
                    <button
                      key={pct}
                      onClick={() => setDiscountPct(pct)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                      style={{
                        backgroundColor: discountPct === pct ? theme.primary : "white",
                        color: discountPct === pct ? "white" : theme.textMuted,
                        borderColor: discountPct === pct ? theme.primary : theme.border,
                      }}
                    >
                      {pct === 50 ? "半額 50%" : pct === 0 ? (language === "de" ? "Kein Rabatt" : "No discount") : `-${pct}%`}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] uppercase tracking-widest" style={{ color: theme.textMuted }}>
                      {language === "de" ? "Individuell" : "Custom"}
                    </span>
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
                  <div className="rounded-lg px-3 py-2 flex justify-between items-center" style={{ backgroundColor: theme.bg }}>
                    <span className="text-[11px] uppercase tracking-widest" style={{ color: theme.textMuted }}>
                      {language === "de" ? "Effektiver Betrag" : "Effective amount"}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: theme.primary }}>
                      {direction === "foreign-eur"
                        ? formatForeign(effectiveInputAmount())
                        : effectiveInputAmount().toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border overflow-hidden -mx-2" style={{ borderColor: theme.border }}>
          <div className="px-5 py-5 text-center" style={{ borderBottom: `1px solid ${theme.borderAlt}` }}>
            <ConversionDisplay
              result={result}
              currency={outputCurrencyLabel === "EUR" ? "EUR" : currency}
              isLoading={isLoading}
              isDark={isDark}
              borderAlt={theme.borderAlt}
            >
              <ExchangeRateDisplay
                rate={getAdjustedRate()}
                isManual={manualRate !== null}
                onManualRateChange={setManualRate}
                isDark={isDark}
                language={language}
                foreignSymbol={config.symbol}
                theme={theme}
              />
            </ConversionDisplay>
          </div>

          {config.isJapan && (
            <button
              onClick={() => { if (taxFreeEligible) setTaxFree(v => !v); }}
              className="w-full flex items-center justify-between px-4 py-3 transition-colors"
              style={{
                backgroundColor: !taxFreeEligible
                  ? "#FAF9F6"
                  : taxFree
                    ? theme.primary
                    : "white",
                cursor: !taxFreeEligible ? "not-allowed" : "pointer",
                opacity: !taxFreeEligible ? 0.6 : 1,
              }}
            >
              <div className="flex flex-col items-start">
                <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: taxFree && taxFreeEligible ? "white" : theme.textMuted }}>
                  Tax Free
                </span>
                <span className="text-[10px]" style={{ color: taxFree && taxFreeEligible ? "rgba(255,255,255,0.6)" : theme.textFaint }}>
                  {taxFreeEligible
                    ? (language === "de" ? "10% MwSt abziehen (Flughafen-Erstattung)" : "Deduct 10% VAT (airport refund)")
                    : (language === "de"
                        ? `Mindestbetrag: ${formatForeign(TAX_FREE_MIN_JPY)} (2026)`
                        : `Min. amount: ${formatForeign(TAX_FREE_MIN_JPY)} (2026)`)}
                </span>
              </div>
              {taxFreeEligible && (
                <div className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0" style={{ backgroundColor: taxFree ? "white" : theme.border }}>
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full transition-all shadow-sm"
                    style={{
                      left: taxFree ? "1.25rem" : "0.125rem",
                      backgroundColor: taxFree ? theme.primary : "white",
                    }}
                  />
                </div>
              )}
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShoppingItems(prev => prev.slice(0, -1))}
            disabled={shoppingItems.length === 0}
            className="flex-1 h-12 rounded-xl font-medium text-sm border transition-all active:scale-95"
            style={{
              borderColor: shoppingItems.length === 0 ? theme.borderAlt : theme.primary,
              color: shoppingItems.length === 0 ? theme.textFaint : theme.primary,
              backgroundColor: "white",
              cursor: shoppingItems.length === 0 ? "not-allowed" : "pointer",
              opacity: shoppingItems.length === 0 ? 0.5 : 1,
            }}
          >
            <Minus className="h-4 w-4 mx-auto" />
          </button>
          <button
            onClick={handleAddToList}
            disabled={!inputValue || effectiveInputAmount() / (1 - discountPct / 100) === 0}
            className="flex-1 h-12 rounded-xl font-medium text-sm border transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderColor: theme.primary, backgroundColor: theme.primary, color: "white" }}
          >
            <Plus className="h-4 w-4 mx-auto" />
          </button>
        </div>

        <button
          onClick={handleSwitchDirection}
          className="w-full h-12 rounded-xl border font-semibold text-sm tracking-widest uppercase flex items-center justify-center gap-2 select-none"
          style={{
            WebkitTapHighlightColor: "transparent",
            borderColor: theme.border,
            color: theme.primary,
            backgroundColor: switchPressed ? theme.bgAlt : "white",
            transform: switchPressed ? "scale(0.97)" : "scale(1)",
            transition: switchPressed ? "none" : "background-color 0.25s ease, transform 0.25s ease",
          }}
        >
          <span style={{ display: "inline-flex", transition: "transform 0.3s ease", transform: direction === "eur-foreign" ? "rotate(0deg)" : "rotate(180deg)" }}>
            <ArrowUp className="h-4 w-4" />
            <ArrowDown className="h-4 w-4" />
          </span>
          {getTranslation(language, "switchDirection")}
        </button>

        <div ref={cashSectionRef} className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: theme.border }}>
          <button
            onClick={() => setShowCash(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" style={{ color: theme.textMuted }} />
              <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                {language === "de" ? "Bargeld-Tracker" : "Cash Tracker"}
              </span>
              {cashBudgetNum > 0 && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: overBudget ? "#F5E8E8" : theme.bgAlt,
                    color: overBudget ? "#9E3A3A" : theme.primary,
                  }}
                >
                  {overBudget ? (language === "de" ? "Limit!" : "Over!") : formatForeign(cashRemaining)}
                </span>
              )}
            </div>
            <ChevronDown
              className="h-4 w-4 transition-transform duration-300"
              style={{ color: theme.textFaint, transform: showCash ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <div style={{ display: "grid", gridTemplateRows: showCash ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}>
            <div style={{ overflow: "hidden" }}>
              <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop: `1px solid ${theme.borderAlt}` }}>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                      Budget ({currency})
                    </label>
                    <a
                      href={atmLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold hover:underline"
                      style={{ color: theme.primary }}
                    >
                      <MapPin className="h-3 w-3" />
                      {language === "de" ? "ATM FINDEN" : "FIND ATM"}
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={cashBudget}
                      onChange={e => {
                        const v = e.target.value.replace(/\./g, "");
                        if (v === "" || /^[0-9]+$/.test(v)) {
                          setCashBudget(v.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
                        }
                      }}
                      placeholder="0"
                      className="h-11 rounded-xl bg-[#FAF9F6] text-[#1A1A1A] px-4 text-lg"
                      style={{ border: `1px solid ${theme.border}` }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: theme.textFaint }}>{config.symbol}</span>
                  </div>
                </div>

                {cashBudgetNum > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] uppercase tracking-widest" style={{ color: theme.textMuted }}>
                      <span>{language === "de" ? "Ausgegeben" : "Spent"}</span>
                      <span>{formatForeign(cashSpent)}</span>
                    </div>

                    <div className="h-2 rounded-full overflow-hidden flex" style={{ backgroundColor: theme.borderAlt }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(0, Math.min(100, (cashRemaining / cashBudgetNum) * 100))}%`,
                          background: overBudget ? "#9E3A3A" : theme.primary,
                          transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease",
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] uppercase tracking-widest">
                      <span style={{ color: theme.textMuted }}>{language === "de" ? "Verbleibend" : "Remaining"}</span>
                      <span className="font-semibold" style={{ color: overBudget ? "#9E3A3A" : theme.primary }}>
                        {overBudget ? "-" : ""}{formatForeign(Math.abs(cashRemaining))}
                      </span>
                    </div>

                    {overBudget && (
                      <div className="rounded-xl border px-4 py-3 space-y-2" style={{ backgroundColor: "#FAF0F0", borderColor: "#E8CECE" }}>
                        <p className="text-xs font-semibold" style={{ color: "#8B3030" }}>
                          {language === "de" ? "Bargeld reicht nicht aus!" : "Insufficient cash!"}
                        </p>
                        <p className="text-[11px]" style={{ color: "#9E3A3A" }}>
                          {language === "de"
                            ? `Du hast ${formatForeign(Math.abs(cashRemaining))} mehr ausgegeben als dein Budget.`
                            : `You've spent ${formatForeign(Math.abs(cashRemaining))} over budget.`}
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
                    style={{ backgroundColor: theme.primary }}
                  >
                    {language === "de" ? "Ausgeben" : "Spend"}{result > 0 && outputCurrencyLabel === currency ? ` (${formatForeign(result)})` : ""}
                  </button>
                  <button
                    onClick={() => setCashSpent(0)}
                    disabled={cashSpent === 0}
                    className="px-4 h-10 rounded-xl border text-xs font-semibold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ borderColor: theme.border, color: theme.textMuted }}
                  >
                    {language === "de" ? "Zurücksetzen" : "Reset"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShoppingList
        items={shoppingItems}
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        onRemoveItem={(id) => setShoppingItems(prev => prev.filter(i => i.id !== id))}
        onUpdateItemName={(id, name) => setShoppingItems(prev => prev.map(i => i.id === id ? { ...i, name } : i))}
        onClear={() => setShoppingItems([])}
        isDark={isDark}
        taxMode="netto"
        language={language}
        currency={currency}
        theme={theme}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        currency={currency}
        onCurrencyChange={onCurrencyChange}
        hasShoppingItems={shoppingItems.length > 0}
      />

      {showIOSPrompt && <InstallPrompt onDismiss={dismissIOSPrompt} language={language} platform={installPlatform} />}
    </div>
  );
}

export default CurrencyConverter;
