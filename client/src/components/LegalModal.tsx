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

const LABELS: Record<Language, { imprint: string; privacy: string }> = {
  de: { imprint: "Impressum", privacy: "Datenschutz" },
  en: { imprint: "Imprint", privacy: "Privacy" },
};

interface Section {
  heading?: string;
  lines: string[];
}

const IMPRINT: Record<Language, Section[]> = {
  de: [
    {
      heading: "Angaben gemäß § 5 DDG",
      lines: ["Engin Sarak", "c/o Nadim Sarak", "Schallmauer 16", "50226 Frechen", "Deutschland"],
    },
    {
      heading: "Kontakt",
      lines: ["mail@enginsarak.com"],
    },
    {
      heading: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
      lines: ["Engin Sarak", "c/o Nadim Sarak", "Schallmauer 16", "50226 Frechen"],
    },
    {
      heading: "Haftung für Inhalte",
      lines: [
        "Die Umrechnungen und Steuerinformationen in TABI dienen der Orientierung. Kurse stammen von externen Anbietern und können von den tatsächlich abgerechneten Beträgen abweichen. Eine Gewähr für Richtigkeit und Aktualität wird nicht übernommen.",
      ],
    },
  ],
  en: [
    {
      heading: "Information pursuant to § 5 DDG",
      lines: ["Engin Sarak", "c/o Nadim Sarak", "Schallmauer 16", "50226 Frechen", "Germany"],
    },
    {
      heading: "Contact",
      lines: ["mail@enginsarak.com"],
    },
    {
      heading: "Responsible for content pursuant to § 18 (2) MStV",
      lines: ["Engin Sarak", "c/o Nadim Sarak", "Schallmauer 16", "50226 Frechen"],
    },
    {
      heading: "Liability for content",
      lines: [
        "Conversions and tax information in TABI are provided for guidance. Rates come from external providers and may differ from the amounts actually billed. No warranty is given for accuracy or timeliness.",
      ],
    },
  ],
};

const PRIVACY: Record<Language, Section[]> = {
  de: [
    {
      heading: "Verantwortlicher",
      lines: ["Engin Sarak, c/o Nadim Sarak, Schallmauer 16, 50226 Frechen, Deutschland", "mail@enginsarak.com"],
    },
    {
      heading: "Daten in der App",
      lines: [
        "TABI hat kein eigenes Benutzerkonto und keinen eigenen Server, der Eingaben speichert. Einkaufsliste, Bargeld-Budget, Währungs- und Spracheinstellung sowie zwischengespeicherte Wechselkurse liegen ausschließlich lokal im Speicher deines Browsers (localStorage) und können dort jederzeit über die Browser-Einstellungen gelöscht werden.",
      ],
    },
    {
      heading: "Hosting",
      lines: [
        "Die App wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA gehostet. Beim Aufruf verarbeitet Vercel technisch notwendige Server-Logdaten wie IP-Adresse, Zeitpunkt, angeforderte Datei, Browsertyp und Betriebssystem. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (sicherer und störungsfreier Betrieb).",
      ],
    },
    {
      heading: "Wechselkurse",
      lines: [
        "Zum Abruf aktueller Kurse werden Anfragen an cdn.jsdelivr.net, currency-api.pages.dev und open.er-api.com gesendet. Dabei wird deine IP-Adresse an den jeweiligen Anbieter übertragen. Es werden keine Beträge, Einkaufslisten oder sonstigen Eingaben übermittelt.",
      ],
    },
    {
      heading: "Externe Links",
      lines: [
        "Die Schaltfläche zur Geldautomatensuche öffnet Google Maps, der Unterstützungs-Link öffnet PayPal. Für diese Dienste gelten die Datenschutzbestimmungen der jeweiligen Anbieter.",
      ],
    },
    {
      heading: "Kein Tracking",
      lines: ["TABI setzt keine Cookies, nutzt keine Analyse-Werkzeuge und bindet keine Werbenetzwerke ein."],
    },
    {
      heading: "Deine Rechte",
      lines: [
        "Dir stehen die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch zu (Art. 15 bis 21 DSGVO) sowie das Recht auf Beschwerde bei einer Aufsichtsbehörde.",
      ],
    },
  ],
  en: [
    {
      heading: "Controller",
      lines: ["Engin Sarak, c/o Nadim Sarak, Schallmauer 16, 50226 Frechen, Germany", "mail@enginsarak.com"],
    },
    {
      heading: "Data in the app",
      lines: [
        "TABI has no user account and no server of its own that stores your input. Shopping list, cash budget, currency and language preference and cached exchange rates are kept only in your browser's local storage and can be cleared at any time through your browser settings.",
      ],
    },
    {
      heading: "Hosting",
      lines: [
        "The app is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA. When the app is opened, Vercel processes technically necessary server log data such as IP address, time, requested file, browser type and operating system. The legal basis is Art. 6(1)(f) GDPR (secure and reliable operation).",
      ],
    },
    {
      heading: "Exchange rates",
      lines: [
        "To retrieve current rates, requests are sent to cdn.jsdelivr.net, currency-api.pages.dev and open.er-api.com. Your IP address is transmitted to the respective provider. No amounts, shopping lists or other input are sent.",
      ],
    },
    {
      heading: "External links",
      lines: [
        "The ATM button opens Google Maps and the support link opens PayPal. The privacy policies of those providers apply to these services.",
      ],
    },
    {
      heading: "No tracking",
      lines: ["TABI sets no cookies, uses no analytics tools and embeds no advertising networks."],
    },
    {
      heading: "Your rights",
      lines: [
        "You have the right to access, rectification, erasure, restriction of processing, data portability and objection (Art. 15 to 21 GDPR) as well as the right to lodge a complaint with a supervisory authority.",
      ],
    },
  ],
};

function LegalModal({ isOpen, initialTab, onClose, language }: Props) {
  const { config } = useCurrency();
  const { theme } = config;
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [tab, setTab] = useState<LegalTab>(initialTab);

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

  if (!rendered) return null;

  const sections = tab === "imprint" ? IMPRINT[language] : PRIVACY[language];
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
          <div
            className="flex-1 flex p-0.5 rounded-xl"
            style={{ background: theme.bgAccent }}
          >
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
        </div>
      </div>
    </div>
  );
}

export type { LegalTab };
export default LegalModal;
