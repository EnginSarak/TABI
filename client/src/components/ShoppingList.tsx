import * as React from "react";
import { useState, useEffect } from "react";
import { Trash2, Clock, X } from "lucide-react";
import { formatCurrency } from "../lib/formatter";
import { getTranslation, type Language } from "../lib/translations";
import type { ForeignCurrency } from "../lib/currencies";
import { useCurrency } from "../contexts/CurrencyContext";

export interface ShoppingItem {
  id: string;
  amountForeign: number;
  currencyCode: ForeignCurrency;
  amountEUR: number;
  timestamp: number;
  name?: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  items: ShoppingItem[];
  totalForeign: number;
  currencyCode: ForeignCurrency;
  totalEUR: number;
}

const HISTORY_KEY = "tabi-shopping-history";

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveHistory(entries: HistoryEntry[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries)); } catch {}
}

interface ShoppingListProps {
  items: ShoppingItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItemName: (id: string, name: string) => void;
  onClear: () => void;
  isDark: boolean;
  taxMode: "netto" | "zeikomi";
  language: Language;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function HistoryView({ onBack, language }: { onBack: () => void; language: Language }) {
  const { config } = useCurrency();
  const { theme } = config;
  const [entries, setEntries] = React.useState<HistoryEntry[]>(() => loadHistory());

  function deleteEntry(id: string) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated); saveHistory(updated);
  }
  function deleteAll() { setEntries([]); saveHistory([]); }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
        <button onClick={onBack} className="text-[11px] font-semibold tracking-widest uppercase flex items-center gap-1.5" style={{ color: theme.primary }}>
          ← {language === "de" ? "Zurück" : "Back"}
        </button>
        <h2 className="text-sm font-semibold tracking-wide text-[#1A1A1A]">{language === "de" ? "Verlauf" : "History"}</h2>
        {entries.length > 0
          ? <button onClick={deleteAll} className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textSubtle }}>{language === "de" ? "Alle löschen" : "Clear all"}</button>
          : <div className="w-16" />}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm tracking-widest uppercase" style={{ color: theme.textSubtle }}>{language === "de" ? "Noch kein Verlauf" : "No history yet"}</p>
          </div>
        ) : (
          [...entries].reverse().map(entry => (
            <div key={entry.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.border}`, background: theme.bgInput }}>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                <span className="text-[11px] tracking-wide" style={{ color: theme.textMuted }}>{formatDateTime(entry.date)}</span>
                <button onClick={() => deleteEntry(entry.id)} className="p-1" style={{ color: theme.textSubtle }}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <div className="px-4 py-2 space-y-1">
                {entry.items.map((item, i) => (
                  <div key={item.id} className="flex justify-between text-xs py-0.5" style={{ color: theme.textMuted }}>
                    <span className="truncate pr-2 font-medium text-[#1A1A1A]">{item.name || `${language === "de" ? "Artikel" : "Item"} ${i + 1}`}</span>
                    <span className="flex-shrink-0">{formatCurrency(item.amountForeign, item.currencyCode)} → {formatCurrency(item.amountEUR, "EUR")}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center px-4 py-2.5" style={{ borderTop: `1px solid ${theme.borderLight}`, background: theme.bgAccent }}>
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: theme.textMuted }}>Total</span>
                <div className="text-right">
                  <div className="text-xs font-semibold text-[#1A1A1A]">{formatCurrency(entry.totalForeign, entry.currencyCode)}</div>
                  <div className="text-xs font-semibold text-[#1A1A1A]">{formatCurrency(entry.totalEUR, "EUR")}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ShoppingList({ items, isOpen, onClose, onRemoveItem, onUpdateItemName, onClear, taxMode, language }: ShoppingListProps) {
  const { config } = useCurrency();
  const { theme, code: currencyCode } = config;
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [showHistory, setShowHistory] = React.useState(false);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    try { localStorage.setItem("tabi-shopping-list", JSON.stringify(items)); } catch {}
  }, [items]);

  useEffect(() => { if (!isOpen) { setShowHistory(false); setConfirmClear(false); } }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setRendered(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const applyTax = (n: number) => taxMode === "zeikomi" ? n * 1.1 : n;
  const totalForeign = items.filter(i => i.currencyCode === currencyCode).reduce((s, i) => s + applyTax(i.amountForeign), 0);
  const totalEUR     = items.reduce((s, i) => s + applyTax(i.amountEUR), 0);

  function handleStartEdit(item: ShoppingItem, index: number) {
    setEditingId(item.id);
    setEditValue(item.name || `${getTranslation(language, "item")} ${index + 1}`);
  }
  function handleSaveEdit(id: string) {
    if (editValue.trim()) onUpdateItemName(id, editValue.trim());
    setEditingId(null); setEditValue("");
  }
  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); return; }
    const entry: HistoryEntry = {
      id: Date.now().toString(), date: new Date().toISOString(),
      items: [...items], totalForeign, currencyCode, totalEUR: Math.round(totalEUR * 100) / 100,
    };
    const history = loadHistory();
    saveHistory([...history, entry]);
    onClear(); setConfirmClear(false);
  }

  if (!rendered) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        backgroundColor: visible ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(2px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(2px)" : "blur(0px)",
        transition: "background-color 0.25s ease, backdrop-filter 0.25s ease",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="absolute left-3 right-3 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          top: "110px",
          maxHeight: "calc(100dvh - 130px)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.25s ease",
        }}
      >
        {showHistory ? (
          <HistoryView onBack={() => setShowHistory(false)} language={language} />
        ) : (
          <>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
              <button onClick={() => setShowHistory(true)} className="p-1.5 transition-colors" style={{ color: theme.textSubtle }} title={language === "de" ? "Verlauf" : "History"}>
                <Clock className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-semibold tracking-wide text-[#1A1A1A]">{getTranslation(language, "yourShoppingList")}</h2>
              <button onClick={onClose} className="p-1.5 transition-colors" style={{ color: theme.textSubtle }}><X className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 min-h-0">
              {items.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm tracking-widest uppercase" style={{ color: theme.textSubtle }}>{getTranslation(language, "listEmpty")}</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: theme.bgAccent, border: `1px solid ${theme.border}` }}>
                    <div className="flex-1 min-w-0">
                      {editingId === item.id ? (
                        <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleSaveEdit(item.id)} onKeyDown={e => e.key === "Enter" && handleSaveEdit(item.id)}
                          autoFocus className="text-sm font-semibold px-2 py-0.5 rounded border bg-white text-[#1A1A1A] w-full outline-none"
                          style={{ borderColor: theme.primary }} />
                      ) : (
                        <p onClick={() => handleStartEdit(item, index)} className="text-sm font-semibold text-[#1A1A1A] cursor-pointer hover:underline truncate">
                          {item.name || `${getTranslation(language, "item")} ${index + 1}`}
                        </p>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                        {formatCurrency(applyTax(item.amountForeign), item.currencyCode)} → {formatCurrency(applyTax(item.amountEUR), "EUR")}
                      </p>
                    </div>
                    <button onClick={() => onRemoveItem(item.id)} className="ml-3 p-1.5 flex-shrink-0 transition-colors" style={{ color: theme.textSubtle }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="flex-shrink-0 px-5 pt-4 pb-5 space-y-3" style={{ borderTop: `1px solid ${theme.borderLight}` }}>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                      {getTranslation(language, "totalForeign")} {currencyCode}:
                    </span>
                    <span className="text-base font-semibold text-[#1A1A1A]">{formatCurrency(totalForeign, currencyCode)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                      {getTranslation(language, "totalEUR")}
                    </span>
                    <span className="text-base font-semibold text-[#1A1A1A]">{formatCurrency(totalEUR, "EUR")}</span>
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  className="w-full h-11 rounded-xl text-sm font-semibold tracking-wide transition-all"
                  style={{
                    background: confirmClear ? "#9E3A3A" : theme.bgInput,
                    border: `1px solid ${confirmClear ? "#9E3A3A" : theme.border}`,
                    color: confirmClear ? "#fff" : theme.textMuted,
                  }}
                >
                  {confirmClear
                    ? (language === "de" ? "Bestätigen · Liste leeren" : "Confirm · Clear list")
                    : (language === "de" ? "Liste leeren & in Verlauf speichern" : "Clear & save to history")}
                </button>
                {confirmClear && (
                  <button onClick={() => setConfirmClear(false)} className="w-full text-xs py-1 transition-colors" style={{ color: theme.textSubtle }}>
                    {language === "de" ? "Abbrechen" : "Cancel"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ShoppingList;
