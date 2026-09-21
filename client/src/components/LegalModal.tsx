import * as React from "react";
import { useState, useEffect } from "react";
import { useCurrency } from "../contexts/CurrencyContext";
import type { Language } from "../lib/translations";

type LegalTab = "imprint" | "privacy";

interface Props {
  isOpen: boolean;
  initialTab: LegalTab;
  onClose: () => void;
  language: Language;
}

interface Section {
  heading?: string;
  lines: string[];
}

type LegalData = Record<Language, Record<LegalTab, Section[]>>;

const LABELS: Record<Language, Record<LegalTab, string>> = {
  de: { imprint: "Impressum", privacy: "Datenschutz" },
  en: { imprint: "Imprint", privacy: "Privacy" },
};

let cached: LegalData | null = null;
let pending: Promise<LegalData | null> | null = null;

function loadLegal(): Promise<LegalData | null> {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = fetch("/legal/legal.json")
      .then(res => (res.ok ? res.json() : null))
      .then((data: LegalData | null) => {
        cached = data;
        pending = null;
        return data;
      })
      .catch(() => {
        pending = null;
        return null;
      });
  }
  return pending;
}

function LegalModal({ isOpen, initialTab, onClose, language }: Props) {
  const { config } = useCurrency();
  const { theme } = config;
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [tab, setTab] = useState<LegalTab>(initialTab);
  const [data, setData] = useState<LegalData | null>(cached);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setRendered(true);
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    }
    setVisible(false);
    const t = setTimeout(() => setRendered(false), 360);
    return () => clearTimeout(t);
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen || data) return;
    let active = true;
    setFailed(false);
    loadLegal().then(result => {
      if (!active) return;
      if (result) setData(result);
      else setFailed(true);
    });
    return () => { active = false; };
  }, [isOpen, data]);

  if (!rendered) return null;

  const sections = data?.[language]?.[tab] ?? [];
  const labels = LABELS[language];

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        backgroundColor: visible ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(3px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(3px)" : "blur(0px)",
        transition: "background-color 0.25s ease, backdrop-filter 0.25s ease",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-3xl flex flex-col overflow-hidden"
        data-nosnippet
        style={{
          background: theme.bgCard,
          maxHeight: "86dvh",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: visible
            ? "transform 0.48s cubic-bezier(0.22,1,0.36,1)"
            : "transform 0.32s cubic-bezier(0.4,0,1,1)",
          boxShadow: "0 -12px 60px rgba(0,0,0,0.2)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
          <div className="h-1 w-9 rounded-full" style={{ background: theme.border }} />
        </div>

        <div
          className="flex items-center gap-3 px-5 pt-2 pb-3 flex-shrink-0"
          style={{ borderBottom: `1px solid ${theme.borderLight}` }}
        >
          <div className="flex-1 flex p-0.5 rounded-xl" style={{ background: theme.bgAccent }}>
            {(["imprint", "privacy"] as LegalTab[]).map(key => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex-1 h-8 rounded-[10px] text-[12px] font-semibold tracking-wide"
                style={{
                  background: tab === key ? theme.bgCard : "transparent",
                  color: tab === key ? theme.primary : theme.textSubtle,
                  boxShadow: tab === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease",
                }}
              >
                {labels[key]}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: theme.bgAccent, color: theme.textSubtle }}
          >
            <span className="text-[13px]">✕</span>
          </button>
        </div>

        <div key={tab} className="flex-1 overflow-y-auto px-5 py-5 space-y-5 tabi-legal-enter">
          {sections.map((section, i) => (
            <div key={i} className="space-y-1.5">
              {section.heading && (
                <p className="text-[12px] font-bold tracking-widest uppercase" style={{ color: theme.primary }}>
                  {section.heading}
                </p>
              )}
              {section.lines.map((line, j) => (
                <p key={j} className="text-[13px] leading-relaxed" style={{ color: theme.textMuted }}>
                  {line}
                </p>
              ))}
            </div>
          ))}

          {sections.length === 0 && (
            <p className="text-[13px] py-6 text-center" style={{ color: theme.textSubtle }}>
              {failed
                ? (language === "de" ? "Keine Verbindung" : "No connection")
                : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export type { LegalTab };
export default LegalModal;
