import * as React from "react";
import { useState, useEffect } from "react";
import { Trash2, Clock, X } from "lucide-react";
import { formatCurrency } from "../lib/formatter";
import { getTranslation, type Language } from "../lib/translations";

export interface ShoppingItem {
  id: string;
  amountJPY: number;
  amountEUR: number;
  timestamp: number;
  name?: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  items: ShoppingItem[];
  totalJPY: number;
  totalEUR: number;
}

const HISTORY_KEY = "jpn-shopping-history";

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
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function HistoryView({ onBack, language }: { onBack: () => void; language: Language }) {
  const [entries, setEntries] = React.useState<HistoryEntry[]>(() => loadHistory());

  function deleteEntry(id: string) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveHistory(updated);
  }

  function deleteAll() {
    setEntries([]);
    saveHistory([]);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E8E3D9] flex-shrink-0">
        <button
          onClick={onBack}
          className="text-[11px] font-semibold tracking-widest uppercase text-[#1B2A4A] flex items-center gap-1.5"
        >
          ← {language === "de" ? "Zurück" : "Back"}
        </button>
        <h2 className="text-sm font-semibold tracking-wide text-[#1A1A1A]">
          {language === "de" ? "Verlauf" : "History"}
        </h2>
        {entries.length > 0 ? (
          <button
            onClick={deleteAll}
            className="text-[11px] font-semibold tracking-widest uppercase text-[#9B948A] hover:text-[#9E3A3A] transition-colors"
          >
            {language === "de" ? "Alle löschen" : "Clear all"}
          </button>
        ) : (
          <div className="w-16" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#9B948A] text-sm tracking-widest uppercase">
              {language === "de" ? "Noch kein Verlauf" : "No history yet"}
            </p>
          </div>
        ) : (
          [...entries].reverse().map(entry => (
            <div key={entry.id} className="rounded-xl border border-[#D4CEBC] bg-[#FAF9F6] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E8E3D9]">
                <span className="text-[11px] text-[#6B6560] tracking-wide">
                  {formatDateTime(entry.date)}
                </span>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="p-1 text-[#C5BFB3] hover:text-[#9E3A3A] transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="px-4 py-2 space-y-1">
                {entry.items.map((item, i) => (
                  <div key={item.id} className="flex justify-between text-xs text-[#6B6560] py-0.5">
                    <span className="truncate pr-2 text-[#1A1A1A] font-medium">
                      {item.name || `${language === "de" ? "Artikel" : "Item"} ${i + 1}`}
                    </span>
                    <span className="flex-shrink-0">
                      {formatCurrency(item.amountJPY, "JPY")} → {formatCurrency(item.amountEUR, "EUR")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center px-4 py-2.5 border-t border-[#E8E3D9] bg-[#F0EDE6]">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6560]">
                  Total
                </span>
                <div className="text-right">
                  <div className="text-xs font-semibold text-[#1A1A1A]">
                    {formatCurrency(entry.totalJPY, "JPY")}
                  </div>
                  <div className="text-xs font-semibold text-[#1A1A1A]">
                    {formatCurrency(entry.totalEUR, "EUR")}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ShoppingList({
  items, isOpen, onClose, onRemoveItem, onUpdateItemName, onClear,
  taxMode, language,
}: ShoppingListProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue]  = React.useState("");
  const [showHistory, setShowHistory] = React.useState(false);
  const [confirmClear, setConfirmClear] = React.useState(false);

  React.useEffect(() => {
    try { localStorage.setItem("jpn-shopping-list", JSON.stringify(items)); } catch {}
  }, [items]);

  React.useEffect(() => {
    if (!isOpen) { setShowHistory(false); setConfirmClear(false); }
  }, [isOpen]);

  const applyTax = (n: number) => taxMode === "zeikomi" ? n * 1.1 : n;
  const totalJPY = items.reduce((s, i) => s + applyTax(i.amountJPY), 0);
  const totalEUR = items.reduce((s, i) => s + applyTax(i.amountEUR), 0);

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
      id:       Date.now().toString(),
      date:     new Date().toISOString(),
      items:    [...items],
      totalJPY: Math.round(totalJPY * 100) / 100,
      totalEUR: Math.round(totalEUR * 100) / 100,
    };
    const history = loadHistory();
    saveHistory([...history, entry]);
    onClear();
    setConfirmClear(false);
  }

  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

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
      onClick={e => { if (e.target === e.currentTarget) { onClose(); } }}
    >
      <div
        className="absolute left-3 right-3 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          top:       "110px",
          maxHeight: "calc(100dvh - 130px)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
          opacity:   visible ? 1 : 0,
          transition: "transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.25s ease",
        }}
      >
        {showHistory ? (
          <HistoryView onBack={() => setShowHistory(false)} language={language} />
        ) : (
          <>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E8E3D9] flex-shrink-0">
              <button
                onClick={() => setShowHistory(true)}
                className="p-1.5 text-[#9B948A] hover:text-[#1B2A4A] transition-colors"
                title={language === "de" ? "Verlauf" : "History"}
              >
                <Clock className="h-4 w-4" />
              </button>

              <h2 className="text-sm font-semibold tracking-wide text-[#1A1A1A]">
                {getTranslation(language, "yourShoppingList")}
              </h2>

              <button
                onClick={onClose}
                className="p-1.5 text-[#9B948A] hover:text-[#1A1A1A] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 min-h-0">
              {items.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[#9B948A] text-sm tracking-widest uppercase">
                    {getTranslation(language, "listEmpty")}
                  </p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F0EDE6] border border-[#D4CEBC]"
                  >
                    <div className="flex-1 min-w-0">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleSaveEdit(item.id)}
                          onKeyDown={e => e.key === "Enter" && handleSaveEdit(item.id)}
                          autoFocus
                          className="text-sm font-semibold px-2 py-0.5 rounded border border-[#1B2A4A] bg-white text-[#1A1A1A] w-full outline-none"
                        />
                      ) : (
                        <p
                          onClick={() => handleStartEdit(item, index)}
                          className="text-sm font-semibold text-[#1A1A1A] cursor-pointer hover:underline truncate"
                        >
                          {item.name || `${getTranslation(language, "item")} ${index + 1}`}
                        </p>
                      )}
                      <p className="text-xs text-[#6B6560] mt-0.5">
                        {formatCurrency(applyTax(item.amountJPY), "JPY")} → {formatCurrency(applyTax(item.amountEUR), "EUR")}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="ml-3 p-1.5 text-[#C5BFB3] hover:text-[#1B2A4A] transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="flex-shrink-0 border-t border-[#E8E3D9] px-5 pt-4 pb-5 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-semibold tracking-widest uppercase text-[#6B6560]">
                      {getTranslation(language, "totalJPY")}
                    </span>
                    <span className="text-base font-semibold text-[#1A1A1A]">
                      {formatCurrency(totalJPY, "JPY")}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-semibold tracking-widest uppercase text-[#6B6560]">
                      {getTranslation(language, "totalEUR")}
                    </span>
                    <span className="text-base font-semibold text-[#1A1A1A]">
                      {formatCurrency(totalEUR, "EUR")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleClear}
                  className={`w-full h-11 rounded-xl text-sm font-semibold tracking-wide transition-all border ${
                    confirmClear
                      ? "bg-[#9E3A3A] border-[#9E3A3A] text-white"
                      : "bg-white border-[#D4CEBC] text-[#6B6560] hover:border-[#1B2A4A] hover:text-[#1B2A4A]"
                  }`}
                >
                  {confirmClear
                    ? (language === "de" ? "Bestätigen · Liste leeren" : "Confirm · Clear list")
                    : (language === "de" ? "Liste leeren & in Verlauf speichern" : "Clear & save to history")}
                </button>
                {confirmClear && (
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="w-full text-xs text-[#9B948A] hover:text-[#1A1A1A] transition-colors py-1"
                  >
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
