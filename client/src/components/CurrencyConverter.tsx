import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import ProviderToggle, { type Provider } from "./ProviderToggle";
import ConversionDisplay from "./ConversionDisplay";
import ExchangeRateDisplay from "./ExchangeRateDisplay";
import ShoppingList, { type ShoppingItem } from "./ShoppingList";
import { fetchExchangeRate, getCachedRate } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../lib/translations";
import { usePersistentState, lsGet, lsSet } from "../lib/storage";
import {
  ShoppingCart, Plus, Minus, ArrowUp, ArrowDown,
  Tag, Wallet, ChevronDown, Wifi, WifiOff, MapPin,
} from "lucide-react";

type Direction = "eur-jpy" | "jpy-eur";
interface CurrencyConverterProps { isDark: boolean; }

const DISCOUNT_PRESETS = [0, 10, 20, 30, 50, 70];
const TAX_FREE_MIN_JPY = 5500;

function IOSInstallPrompt({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pb-6 px-4 pointer-events-none">
      <div
        className="w-full max-w-sm bg-[#1B2A4A] rounded-2xl px-5 py-4 shadow-2xl pointer-events-auto flex items-start gap-3"
        style={{ backdropFilter: "blur(12px)" }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-white text-[13px] font-semibold leading-snug">
            Add Tabi to your Home Screen
          </p>
          <p className="text-white/60 text-[12px] mt-1 leading-snug">
            Tap <span className="text-white font-medium">Share</span> then <span className="text-white font-medium">"Add to Home Screen"</span> for the full app experience.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-white/40 text-lg leading-none flex-shrink-0 mt-0.5 px-1"
        >
          ✕
        </button>
      </div>
      <div className="text-white/70 text-xl mt-2 animate-bounce pointer-events-none select-none">↓</div>
    </div>
  );
}

function CurrencyConverter({ isDark }: CurrencyConverterProps) {
  const { language, setLanguage } = useLanguage();

  const [provider,      setProvider]      = usePersistentState<Provider>("tabi-provider",      "visa");
  const [direction,     setDirection]     = usePersistentState<Direction>("tabi-direction",    "jpy-eur");
  const [discountPct,   setDiscountPct]   = usePersistentState<number>  ("tabi-discount",      0);
  const [taxFree,       setTaxFree]       = usePersistentState<boolean> ("tabi-taxfree",       false);
  const [showDiscount, setShowDiscount] = usePersistentState<boolean> ("tabi-show-discount", false);
  const [showCash,      setShowCash]      = usePersistentState<boolean> ("tabi-show-cash",     false);
  const [cashBudget,    setCashBudget]    = usePersistentState<string>  ("jpn-cash-budget",    "");
  const [cashSpent,     setCashSpent]     = usePersistentState<number>  ("jpn-cash-spent",     0);

  const [shoppingItems, setShoppingItems] = usePersistentState<ShoppingItem[]>(
    "jpn-shopping-list", [],
  );

  const [inputValue,    setInputValue]  = useState<string>("");
  const [baseRate,      setBaseRate]    = useState<number | null>(null);
  const [manualRate,    setManualRate]  = useState<number | null>(null);
  const [lastUpdated,   setLastUpdated] = useState<string>("");
  const [isLoading,     setIsLoading]    = useState<boolean>(true);
  const [isOffline,     setIsOffline]    = useState<boolean>(false);
  const [isListOpen,    setIsListOpen]  = useState(false);
  const [switchPressed, setSwitchPressed] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const cashSectionRef = useRef<HTMLDivElement>(null);
  const cashMountedRef = useRef(false);

  const TICKER_PROVIDERS = [
    { label: "Mastercard", divisor: 1.0045 },
    { label: "Visa",        divisor: 1.0055 },
    { label: "American Express", divisor: 1.025  },
  ] as const;
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerKey,    setTickerKey]   = useState(0);

  useEffect(() => { loadExchangeRate(); }, []);

  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isStandalone = (window.navigator as any).standalone === true;
    const hasShown = localStorage.getItem("tabi-ios-prompt-shown");
    if (isIOS && !isStandalone && !hasShown) {
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
    const cached = getCachedRate();
    if (cached) {
      setBaseRate(cached.rate);
      setLastUpdated(cached.timestamp);
      setIsLoading(false);
    } else { setIsLoading(true); }
    const fresh = await fetchExchangeRate();
    if (fresh) {
      setBaseRate(fresh.rate);
      setLastUpdated(fresh.timestamp);
      setIsOffline(false);
    } else { setIsOffline(true); }
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
    const raw = direction === "eur-jpy"
      ? parseFloat(inputValue.replace(",", ".")) || 0
      : parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;
    return raw * (1 - discountPct / 100);
  }

  function calculateConversion(): number {
    const rate = getAdjustedRate();
    if (!rate) return 0;
    const amount = effectiveInputAmount();
    const converted = direction === "eur-jpy" ? amount * rate : amount / rate;
    return taxFree ? converted / 1.1 : converted;
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    if (direction === "eur-jpy") {
      value = value.replace(".", ",");
      if (value === "" || /^[0-9]+,?[0-9]{0,2}$/.test(value)) setInputValue(value);
    } else {
      value = value.replace(/\./g, "");
      if (value === "" || /^[0-9,]*$/.test(value)) {
        const fmt = value.replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setInputValue(fmt || value);
      }
    }
  }

  function handleAddToList() {
    const inputAmount = parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;
    if (inputAmount === 0) return;
    const rate = getAdjustedRate();
    const eff  = effectiveInputAmount();
    const amountJPY = direction === "jpy-eur" ? eff : eff * rate;
    const amountEUR = direction === "jpy-eur" ? eff / rate : eff;
    setShoppingItems(prev => [...prev, { id: Date.now().toString(), amountJPY, amountEUR, timestamp: Date.now() }]);
    setInputValue("");
  }

  const cashBudgetNum  = parseFloat(cashBudget.replace(/\./g, "").replace(",", ".")) || 0;
  const cashRemaining  = cashBudgetNum - cashSpent;
  const overBudget       = cashRemaining < 0;
  const result           = calculateConversion();
  const inputCurrency   = direction === "eur-jpy" ? "EUR" : "JPY";
  const outputCurrency = direction === "eur-jpy" ? "JPY" : "EUR";

  const currentJPY = direction === "jpy-eur" ? effectiveInputAmount() : result;
  const taxFreeEligible = currentJPY >= TAX_FREE_MIN_JPY;

  function handleSpendCash() {
    const rate = getAdjustedRate();
    const jpyAmount = outputCurrency === "JPY" ? result : result * rate;
    setCashSpent(prev => prev + jpyAmount);
  }

  function formatJPY(n: number) {
    return n.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " \u00a5";
  }

  function handleSwitchDirection() {
    setSwitchPressed(true);
    setDirection(d => d === "eur-jpy" ? "jpy-eur" : "eur-jpy");
    setTimeout(() => setSwitchPressed(false), 160);
  }

  const atmLink = "https://www.google.com/maps/search/ATM+Geldautomat";

  return (
    <div className="flex flex-col min-h-screen bg-[#F0EDE6]">

      <div className="bg-[#1B2A4A] text-white flex-shrink-0 z-50 shadow-md"
           style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center justify-between px-4 h-20">

          <div className="w-12 flex-shrink-0">
            <button
              onClick={() => setLanguage(language === "en" ? "de" : "en")}
              className="text-white/60 hover:text-white text-[11px] font-bold tracking-widest border border-white/20 px-2 py-1.5 rounded transition-colors"
            >
              {language === "en" ? "DE" : "EN"}
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
              <span
                key={shoppingItems.length}
                className="absolute top-0 right-0 bg-white text-[#1B2A4A] text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
                style={{ animation: shoppingItems.length > 0 ? "tabi-badge-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "tabi-badge-out 0.2s ease-in forwards" }}
              >
                {shoppingItems.length > 0 ? shoppingItems.length : ""}
              </span>
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
      <div className="bg-[#EAE6DE] flex items-center justify-between px-4 py-1.5 border-b border-[#D4CEBC]">

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
                      style={{ color: "#6B6560", fontSize: "10px" }}
                    >
                      {label}
                    </span>
                    <span className="font-medium whitespace-nowrap" style={{ color, fontSize: "10px" }}>
                      {today.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ¥
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <span className="text-[10px] text-[#C5BFB3] tracking-widest uppercase">--</span>
        )}

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
          {isOffline
            ? <WifiOff className="h-3 w-3 text-[#C57A5A]" />
            : <Wifi    className="h-3 w-3 text-[#9B948A]" />}
          <p className={`text-[10px] tracking-widest uppercase ${isOffline ? "text-[#C57A5A]" : "text-[#9B948A]"}`}>
            {isOffline
              ? (language === "de" ? "Offline" : "Offline")
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
        <ProviderToggle provider={provider} onProviderChange={setProvider} isDark={isDark} language={language} />

        <div className="space-y-2">
          <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#6B6560]">
            {getTranslation(language, "amountIn")} {inputCurrency}
          </label>
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={direction === "eur-jpy" ? "0,00" : "0"}
              className="text-3xl h-14 rounded-xl border border-[#D4CEBC] focus:border-[#1B2A4A] focus:ring-2 focus:ring-[#1B2A4A]/10 bg-white text-[#1A1A1A] placeholder:text-[#C5BFB3] transition-all px-4"
              disabled={isLoading}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-[#9B948A]">
              {inputCurrency === "EUR" ? "\u20ac" : "\u00a5"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-[#D4CEBC] bg-white overflow-hidden">
          <button
            onClick={() => setShowDiscount(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#6B6560]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[#6B6560]">
                {language === "de" ? "Rabatt" : "Discount"}
              </span>
              {discountPct > 0 && (
                <span className="bg-[#1B2A4A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  -{discountPct}%
                </span>
              )}
            </div>
            <ChevronDown
              className="h-4 w-4 text-[#9B948A] transition-transform duration-300"
              style={{ transform: showDiscount ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <div style={{ display: "grid", gridTemplateRows: showDiscount ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}>
          <div style={{ overflow: "hidden" }}>
          <div className="px-4 pb-4 space-y-3 border-t border-[#E8E3D9]">
              <div className="pt-3 flex flex-wrap gap-2">
                {DISCOUNT_PRESETS.map(pct => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPct(pct)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      discountPct === pct
                        ? "bg-[#1B2A4A] text-white border-[#1B2A4A]"
                        : "bg-white text-[#6B6560] border-[#D4CEBC] hover:border-[#1B2A4A]"
                    }`}
                  >
                    {pct === 50 ? "\u534a\u984d 50%" : pct === 0 ? (language === "de" ? "Kein Rabatt" : "No discount") : `-${pct}%`}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#6B6560] uppercase tracking-widest">
                    {language === "de" ? "Individuell" : "Custom"}
                  </span>
                  <span className="text-sm font-semibold text-[#1B2A4A]">{discountPct}%</span>
                </div>
                <input
                  type="range" min={0} max={70} step={1} value={discountPct}
                  onChange={e => setDiscountPct(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #1B2A4A ${discountPct / 70 * 100}%, #D4CEBC ${discountPct / 70 * 100}%)` }}
                />
              </div>
              {discountPct > 0 && inputValue && effectiveInputAmount() > 0 && (
                <div className="bg-[#F0EDE6] rounded-lg px-3 py-2 flex justify-between items-center">
                  <span className="text-[11px] text-[#6B6560] uppercase tracking-widest">
                    {language === "de" ? "Effektiver Betrag" : "Effective amount"}
                  </span>
                  <span className="text-sm font-semibold text-[#1B2A4A]">
                    {direction === "jpy-eur"
                      ? formatJPY(effectiveInputAmount())
                      : effectiveInputAmount().toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20ac"}
                  </span>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-[#D4CEBC] overflow-hidden -mx-2">
          <div className="px-5 py-5 text-center border-b border-[#E8E3D9]">
            <ConversionDisplay result={result} currency={outputCurrency} isLoading={isLoading} isDark={isDark}>
              <ExchangeRateDisplay
                rate={getAdjustedRate()}
                isManual={manualRate !== null}
                onManualRateChange={setManualRate}
                isDark={isDark}
                language={language}
              />
            </ConversionDisplay>
          </div>

          <button
            onClick={() => { if (taxFreeEligible) setTaxFree(v => !v); }}
            className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
              !taxFreeEligible
                ? "bg-[#FAF9F6] cursor-not-allowed opacity-60"
                : taxFree
                  ? "bg-[#1B2A4A]"
                  : "bg-white hover:bg-[#F0EDE6]"
            }`}
          >
            <div className="flex flex-col items-start">
              <span className={`text-[11px] font-semibold tracking-widest uppercase ${taxFree && taxFreeEligible ? "text-white" : "text-[#6B6560]"}`}>
                Tax Free
              </span>
              <span className={`text-[10px] ${taxFree && taxFreeEligible ? "text-white/60" : "text-[#9B948A]"}`}>
                {taxFreeEligible
                  ? (language === "de" ? "10% MwSt abziehen (Flughafen-Erstattung)" : "Deduct 10% VAT (airport refund)")
                  : (language === "de"
                      ? `Mindestbetrag: ${formatJPY(TAX_FREE_MIN_JPY)} (2026)`
                      : `Min. amount: ${formatJPY(TAX_FREE_MIN_JPY)} (2026)`)}
              </span>
            </div>
            {taxFreeEligible && (
              <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${taxFree ? "bg-white" : "bg-[#D4CEBC]"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all shadow-sm ${taxFree ? "left-5 bg-[#1B2A4A]" : "left-0.5 bg-white"}`} />
              </div>
            )}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShoppingItems(prev => prev.slice(0, -1))}
            disabled={shoppingItems.length === 0}
            className={`flex-1 h-12 rounded-xl font-medium text-sm border transition-all active:scale-95 ${
              shoppingItems.length === 0
                ? "border-[#DDD8CF] text-[#C5BFB3] bg-white cursor-not-allowed"
                : "border-[#1B2A4A] text-[#1B2A4A] bg-white hover:bg-[#1B2A4A] hover:text-white"
            }`}
          >
            <Minus className="h-4 w-4 mx-auto" />
          </button>
          <button
            onClick={handleAddToList}
            disabled={!inputValue || parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) === 0}
            className="flex-1 h-12 rounded-xl font-medium text-sm border border-[#1B2A4A] bg-[#1B2A4A] text-white hover:bg-[#243660] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mx-auto" />
          </button>
        </div>

        <button
          onClick={handleSwitchDirection}
          className="w-full h-12 rounded-xl border border-[#D4CEBC] text-[#1B2A4A] font-semibold text-sm tracking-widest uppercase flex items-center justify-center gap-2 select-none"
          style={{
            WebkitTapHighlightColor: "transparent",
            backgroundColor: switchPressed ? "#DDD8CF" : "#FFFFFF",
            transform: switchPressed ? "scale(0.97)" : "scale(1)",
            transition: switchPressed ? "none" : "background-color 0.25s ease, transform 0.25s ease",
          }}
        >
          <span style={{ display: "inline-flex", transition: "transform 0.3s ease", transform: direction === "eur-jpy" ? "rotate(0deg)" : "rotate(180deg)" }}>
            <ArrowUp className="h-4 w-4" />
            <ArrowDown className="h-4 w-4" />
          </span>
          {getTranslation(language, "switchDirection")}
        </button>

        <div ref={cashSectionRef} className="rounded-xl border border-[#D4CEBC] bg-white overflow-hidden">
          <button
            onClick={() => setShowCash(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#6B6560]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[#6B6560]">
                {language === "de" ? "Bargeld-Tracker" : "Cash Tracker"}
              </span>
              {cashBudgetNum > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  overBudget ? "bg-[#F5E8E8] text-[#9E3A3A]" : "bg-[#F0EDE6] text-[#1B2A4A]"
                }`}>
                  {overBudget ? (language === "de" ? "Limit!" : "Over!") : formatJPY(cashRemaining)}
                </span>
              )}
            </div>
          <ChevronDown
              className="h-4 w-4 text-[#9B948A] transition-transform duration-300"
              style={{ transform: showCash ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <div style={{ display: "grid", gridTemplateRows: showCash ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}>
          <div style={{ overflow: "hidden" }}>
          <div className="border-t border-[#E8E3D9] px-4 pb-4 pt-3 space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold tracking-widest uppercase text-[#6B6560]">
                    Budget (JPY)
                  </label>
                  <a
                    href={atmLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1B2A4A] hover:underline"
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
                    className="h-11 rounded-xl border border-[#D4CEBC] bg-[#FAF9F6] text-[#1A1A1A] px-4 text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#9B948A]">¥</span>
                </div>
              </div>

              {cashBudgetNum > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-[#6B6560] uppercase tracking-widest">
                    <span>{language === "de" ? "Ausgegeben" : "Spent"}</span>
                    <span>{formatJPY(cashSpent)}</span>
                  </div>

                  <div className="h-2 rounded-full bg-[#E8E3D9] overflow-hidden flex">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width:      `${Math.max(0, Math.min(100, (cashRemaining / cashBudgetNum) * 100))}%`,
                        background: overBudget ? "#9E3A3A" : "#1B2A4A",
                        transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease",
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] uppercase tracking-widest">
                    <span className="text-[#6B6560]">{language === "de" ? "Verbleibend" : "Remaining"}</span>
                    <span className={`font-semibold ${overBudget ? "text-[#9E3A3A]" : "text-[#1B2A4A]"}`}>
                      {overBudget ? "-" : ""}{formatJPY(Math.abs(cashRemaining))}
                    </span>
                  </div>

                  {overBudget && (
                    <div className="rounded-xl bg-[#FAF0F0] border border-[#E8CECE] px-4 py-3 space-y-2">
                      <p className="text-xs font-semibold text-[#8B3030]">
                        {language === "de"
                          ? "Bargeld reicht nicht aus!"
                          : "Insufficient cash!"}
                      </p>
                      <p className="text-[11px] text-[#9E3A3A]">
                        {language === "de"
                          ? `Du hast ${formatJPY(Math.abs(cashRemaining))} mehr ausgegeben als dein Budget.`
                          : `You've spent ${formatJPY(Math.abs(cashRemaining))} over budget.`}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSpendCash}
                  disabled={result === 0 || cashBudgetNum === 0}
                  className="flex-1 h-10 rounded-xl bg-[#1B2A4A] text-white text-xs font-semibold tracking-wide transition-all hover:bg-[#243660] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {language === "de" ? "Ausgeben" : "Spend"}{result > 0 && outputCurrency === "JPY" ? ` (${formatJPY(result)})` : ""}
                </button>
                <button
                  onClick={() => setCashSpent(0)}
                  disabled={cashSpent === 0}
                  className="px-4 h-10 rounded-xl border border-[#D4CEBC] text-[#6B6560] text-xs font-semibold hover:border-[#1B2A4A] hover:text-[#1B2A4A] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {language === "de" ? "Zurucksetzen" : "Reset"}
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
      />

      {showIOSPrompt && <IOSInstallPrompt onDismiss={dismissIOSPrompt} />}
    </div>
  );
}

export default CurrencyConverter;
