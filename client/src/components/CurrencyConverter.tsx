import * as React from "react";
import { useState, useEffect } from "react";
import { Settings, ArrowUpDown, ShoppingBag, Info } from "lucide-react";
import { useCurrency } from "../contexts/CurrencyContext";
import { useLanguage } from "../contexts/LanguageContext";
import { fetchExchangeRate, getCachedRate } from "../lib/api";
import { usePersistentState } from "../lib/storage";
import { getTranslation } from "../lib/translations";
import ConversionDisplay from "./ConversionDisplay";
import ExchangeRateDisplay from "./ExchangeRateDisplay";
import TaxToggle from "./TaxToggle";
import ProviderToggle from "./ProviderToggle";
import type { Provider } from "./ProviderToggle";
import ShoppingList from "./ShoppingList";
import type { ShoppingItem } from "./ShoppingList";
import SettingsModal from "./SettingsModal";
import TaxFreeInfoModal from "./TaxFreeInfoModal";
import Footer from "./Footer";

interface Props {
  isDark: boolean;
}

type Direction = "FOREIGN_TO_EUR" | "EUR_TO_FOREIGN";

function CurrencyConverter({ isDark }: Props) {
  const { currency, config } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const { theme, taxVatRate, taxFreeMin } = config;

  const [rawInput, setRawInput] = usePersistentState<string>("tabi-input", "");
  const [direction, setDirection] = usePersistentState<Direction>("tabi-direction", "FOREIGN_TO_EUR");
  const [taxMode, setTaxMode] = usePersistentState<"netto" | "zeikomi">("tabi-tax-mode", "netto");
  const [provider, setProvider] = usePersistentState<Provider>("tabi-provider", "mastercard");

  const [apiRate, setApiRate] = useState<number | null>(null);
  const [manualRate, setManualRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rateTimestamp, setRateTimestamp] = useState("");

  const [items, setItems] = usePersistentState<ShoppingItem[]>("tabi-list", []);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTaxFreeOpen, setIsTaxFreeOpen] = useState(false);
  const [addFlash, setAddFlash] = useState(false);

  useEffect(() => {
    setManualRate(null);
    setIsLoading(true);
    const cached = getCachedRate(currency);
    if (cached) {
      setApiRate(cached.rate);
      setRateTimestamp(cached.timestamp);
      setIsLoading(false);
    }
    fetchExchangeRate(currency).then(res => {
      if (res) {
        setApiRate(res.rate);
        setRateTimestamp(res.timestamp);
      }
      setIsLoading(false);
    });
  }, [currency]);

  const effectiveRate = manualRate ?? apiRate ?? 0;
  const parsedInput = parseFloat(rawInput.replace(",", ".")) || 0;
  const taxMult = taxMode === "zeikomi" && taxVatRate ? 1 + taxVatRate : 1;

  const resultValue = (() => {
    if (!effectiveRate || !parsedInput) return 0;
    if (direction === "FOREIGN_TO_EUR") return (parsedInput / effectiveRate) * taxMult;
    return parsedInput * effectiveRate * taxMult;
  })();

  const resultCurrency = direction === "FOREIGN_TO_EUR" ? "EUR" : currency;

  const inputLabel = direction === "FOREIGN_TO_EUR"
    ? `${getTranslation(language, "amountIn")} ${currency}`
    : `${getTranslation(language, "amountIn")} EUR`;

  function handleAddToList() {
    if (!parsedInput || !effectiveRate) return;
    const foreignNetto = direction === "FOREIGN_TO_EUR" ? parsedInput : parsedInput * effectiveRate;
    const eurNetto = direction === "FOREIGN_TO_EUR" ? parsedInput / effectiveRate : parsedInput;
    const item: ShoppingItem = {
      id: Date.now().toString(),
      amountForeign: foreignNetto,
      currencyCode: currency,
      amountEUR: eurNetto,
      timestamp: Date.now(),
    };
    setItems(prev => [...prev, item]);
    setAddFlash(true);
    setTimeout(() => setAddFlash(false), 600);
  }

  function handleRemoveItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function handleUpdateItemName(id: string, name: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, name } : i));
  }

  function handleClearItems() {
    setItems([]);
  }

  const canAdd = parsedInput > 0 && effectiveRate > 0;

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: theme.bg }}
    >
      <div
        className="max-w-sm mx-auto px-4"
        style={{ paddingTop: "env(safe-area-inset-top, 16px)" }}
      >
        <div className="flex items-center justify-between py-4">
          <img
            src="/tabi-logo-horizontal-dark.svg"
            alt="TABI"
            style={{ height: "34px", width: "auto" }}
            draggable={false}
          />
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-90"
            style={{ background: theme.bgAccent, border: `1px solid ${theme.border}` }}
          >
            <Settings className="h-4 w-4" style={{ color: theme.textMuted }} />
          </button>
        </div>

        <div
          className="rounded-3xl overflow-hidden mb-4"
          style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center justify-between gap-3">
              <ExchangeRateDisplay
                rate={effectiveRate}
                isManual={!!manualRate}
                onManualRateChange={setManualRate}
                isDark={isDark}
                language={language}
              />
              {taxFreeMin !== undefined && (
                <button
                  onClick={() => setIsTaxFreeOpen(true)}
                  className="flex items-center gap-1 flex-shrink-0 transition-opacity active:opacity-60"
                  style={{ color: theme.primary }}
                >
                  <Info className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold tracking-widest uppercase">Tax Free</span>
                </button>
              )}
            </div>
            {rateTimestamp && (
              <p className="text-[10px] tracking-widest mt-1" style={{ color: theme.textSubtle }}>
                {getTranslation(language, "updated")}: {rateTimestamp}
              </p>
            )}
          </div>

          <ConversionDisplay
            result={resultValue}
            currency={resultCurrency as any}
            isLoading={isLoading}
            isDark={isDark}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: theme.textSubtle }}>
                  {inputLabel}
                </p>
                <input
                  type="number"
                  inputMode="decimal"
                  value={rawInput}
                  onChange={e => setRawInput(e.target.value)}
                  placeholder="0"
                  className="text-[1.6rem] font-semibold w-full bg-transparent outline-none leading-tight"
                  style={{ color: "#1A1A1A" }}
                />
              </div>
              <button
                onClick={() => setDirection(d => d === "FOREIGN_TO_EUR" ? "EUR_TO_FOREIGN" : "FOREIGN_TO_EUR")}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
                style={{ background: theme.bgAccent, border: `1px solid ${theme.border}` }}
              >
                <ArrowUpDown className="h-4 w-4" style={{ color: theme.textMuted }} />
              </button>
            </div>
          </ConversionDisplay>
        </div>

        {taxVatRate !== undefined && (
          <div className="mb-4">
            <TaxToggle
              taxMode={taxMode}
              onTaxModeChange={setTaxMode}
              isDark={isDark}
              language={language}
            />
          </div>
        )}

        <div className="mb-4">
          <ProviderToggle
            provider={provider}
            onProviderChange={setProvider}
            isDark={isDark}
            language={language}
          />
        </div>

        <button
          onClick={handleAddToList}
          disabled={!canAdd}
          className="w-full h-14 rounded-2xl font-semibold text-sm tracking-wide mb-3 transition-all active:scale-[0.98]"
          style={{
            background: canAdd ? theme.primary : theme.bgAccent,
            color: canAdd ? "#fff" : theme.textSubtle,
            border: `1px solid ${canAdd ? theme.primary : theme.border}`,
            opacity: canAdd ? 1 : 0.5,
            transform: addFlash ? "scale(0.97)" : "scale(1)",
            transition: "all 0.15s ease",
          }}
        >
          {addFlash
            ? (language === "de" ? "✓ Hinzugefügt" : "✓ Added")
            : `+ ${language === "de" ? "Zur Liste hinzufügen" : "Add to list"}`
          }
        </button>

        {items.length > 0 && (
          <button
            onClick={() => setIsListOpen(true)}
            className="w-full h-12 rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              background: theme.bgCard,
              border: `1px solid ${theme.border}`,
              color: theme.textMuted,
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            {getTranslation(language, "yourShoppingList")}
            <span
              className="ml-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: theme.primary, color: "#fff" }}
            >
              {items.length}
            </span>
          </button>
        )}
      </div>

      <Footer />

      <ShoppingList
        items={items}
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        onRemoveItem={handleRemoveItem}
        onUpdateItemName={handleUpdateItemName}
        onClear={handleClearItems}
        isDark={isDark}
        taxMode={taxMode}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
      />

      <TaxFreeInfoModal
        isOpen={isTaxFreeOpen}
        onClose={() => setIsTaxFreeOpen(false)}
        language={language}
      />
    </div>
  );
}

export default CurrencyConverter;
