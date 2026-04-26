import * as React from "react";
import { useState, useEffect } from "react";
import { useCurrency } from "../contexts/CurrencyContext";
import type { Language } from "../lib/translations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const INFO: Record<string, {
  en: { title: string; sections: { heading: string; body: string }[] };
  de: { title: string; sections: { heading: string; body: string }[] };
}> = {
  JPY: {
    en: {
      title: "Tax Free Shopping in Japan",
      sections: [
        {
          heading: "How it works",
          body: "Japan refunds its 10% consumption tax to non-resident tourists on eligible goods purchased in a single transaction. The refund is applied immediately at the register — you never pay the tax upfront.",
        },
        {
          heading: "Minimum purchase",
          body: "¥5,500 per store (incl. tax) from January 2026. Consumables (food, cosmetics, drinks) and general goods (electronics, clothing) must be purchased separately to meet the threshold.",
        },
        {
          heading: "Who qualifies",
          body: "Foreign passport holders staying in Japan for less than 6 months. Your passport is scanned at the register. Japanese residents and long-stay visa holders do not qualify.",
        },
        {
          heading: "Conditions",
          body: "Goods must leave Japan within 30 days of purchase. Items must remain sealed and unused inside Japan. Customs may inspect purchases at the airport.",
        },
        {
          heading: "Where to claim",
          body: "Directly at the store — look for the 'Tax Free' sign or ask at the register. No airport refund desk needed for Japan.",
        },
      ],
    },
    de: {
      title: "Tax Free Einkaufen in Japan",
      sections: [
        {
          heading: "So funktioniert es",
          body: "Japan erstattet Nicht-Ansässigen 10% Verbrauchssteuer auf geeignete Waren, die in einer einzigen Transaktion gekauft wurden. Die Erstattung erfolgt direkt an der Kasse — du zahlst die Steuer gar nicht erst.",
        },
        {
          heading: "Mindestbetrag",
          body: "¥5.500 pro Geschäft (inkl. Steuer) ab Januar 2026. Verbrauchsgüter (Lebensmittel, Kosmetik, Getränke) und allgemeine Waren (Elektronik, Kleidung) müssen getrennt gekauft werden, um den Schwellenwert zu erreichen.",
        },
        {
          heading: "Wer hat Anspruch",
          body: "Ausländische Reisepassinhaber mit einem Aufenthalt von weniger als 6 Monaten. Dein Pass wird an der Kasse gescannt. Japanische Einwohner und Langzeitvisum-Inhaber qualifizieren sich nicht.",
        },
        {
          heading: "Bedingungen",
          body: "Waren müssen Japan innerhalb von 30 Tagen nach dem Kauf verlassen. Artikel müssen in Japan versiegelt und unbenutzt bleiben. Der Zoll kann Einkäufe am Flughafen kontrollieren.",
        },
        {
          heading: "Wo einlösen",
          body: "Direkt im Geschäft — achte auf das 'Tax Free' Schild oder frage an der Kasse. Kein Flughafen-Erstattungsschalter nötig.",
        },
      ],
    },
  },
  TRY: {
    en: {
      title: "VAT Refund (KDV) in Turkey",
      sections: [
        {
          heading: "How it works",
          body: "Turkey charges 20% VAT (KDV). Non-resident tourists can reclaim it on eligible goods at the airport before departure. Look for stores with a Global Blue (blue sign) or Tax Free Zone (red sign) sticker.",
        },
        {
          heading: "Minimum purchase",
          body: "₺1,000 excl. VAT (approx. ₺1,200 incl. VAT) per single invoice. Multiple small purchases from different stores cannot be combined to reach the threshold.",
        },
        {
          heading: "Who qualifies",
          body: "Foreign passport holders who are not residents of Turkey. Turkish citizens living abroad also qualify if they can prove non-residency.",
        },
        {
          heading: "Conditions",
          body: "Goods must be exported within 3 months of purchase. Items must be unused. Fuel, hotel accommodation, and car rental are not eligible.",
        },
        {
          heading: "How to claim",
          body: "1. Ask the store for a Tax Free Form at purchase. 2. Before check-in at the airport, go to Customs with your goods, form, and passport — they will stamp it. 3. After passport control, collect your cash or card refund at the Global Blue or Tax Free Zone office.",
        },
      ],
    },
    de: {
      title: "MwSt.-Erstattung (KDV) in der Türkei",
      sections: [
        {
          heading: "So funktioniert es",
          body: "Die Türkei erhebt 20% MwSt. (KDV). Nicht ansässige Touristen können diese auf berechtigte Waren am Flughafen vor der Abreise zurückfordern. Suche nach Geschäften mit Global Blue (blues Schild) oder Tax Free Zone (rotes Schild).",
        },
        {
          heading: "Mindestbetrag",
          body: "₺1.000 exkl. MwSt. (ca. ₺1.200 inkl. MwSt.) pro einzelner Rechnung. Mehrere kleine Einkäufe aus verschiedenen Geschäften können nicht zusammengerechnet werden.",
        },
        {
          heading: "Wer hat Anspruch",
          body: "Ausländische Reisepassinhaber, die nicht in der Türkei ansässig sind. Auch türkische Staatsbürger im Ausland können sich qualifizieren, wenn sie die Nicht-Ansässigkeit nachweisen können.",
        },
        {
          heading: "Bedingungen",
          body: "Waren müssen innerhalb von 3 Monaten nach dem Kauf exportiert werden. Artikel müssen unbenutzt sein. Kraftstoff, Hotelübernachtungen und Autovermietung sind nicht erstattungsfähig.",
        },
        {
          heading: "So beantragen",
          body: "1. Bitte das Geschäft um ein Tax Free Formular beim Kauf. 2. Gehe vor dem Check-in am Flughafen mit Waren, Formular und Pass zum Zoll — dieser stempelt das Formular. 3. Nach der Passkontrolle Bargeld oder Kartenerstattung am Global Blue oder Tax Free Zone Schalter abholen.",
        },
      ],
    },
  },
  CHF: {
    en: {
      title: "VAT Refund in Switzerland",
      sections: [
        {
          heading: "How it works",
          body: "Switzerland charges 8.1% VAT on most goods. Non-EU tourists can reclaim it at the border or airport when leaving. The process is handled directly between you and the store — there is no nationwide third-party operator like Global Blue required.",
        },
        {
          heading: "Minimum purchase",
          body: "CHF 300 per single purchase transaction (incl. VAT). This is a strict per-invoice threshold — multiple receipts cannot be combined.",
        },
        {
          heading: "Who qualifies",
          body: "Tourists who do not reside in Switzerland or the EU customs territory. You must be able to show proof of export (stamped form) and export the goods within 90 days of purchase.",
        },
        {
          heading: "Conditions",
          body: "Goods must be unused and available for customs inspection. Items must be exported within 90 days. The refund is processed by the store, not a government office.",
        },
        {
          heading: "How to claim",
          body: "1. Ask the store for a signed Export Document at purchase. 2. At the Swiss border or airport, present the goods + document to customs — they stamp it. 3. Return the stamped document to the store (by mail or in person) to receive your refund by card or cash.",
        },
      ],
    },
    de: {
      title: "MwSt.-Erstattung in der Schweiz",
      sections: [
        {
          heading: "So funktioniert es",
          body: "Die Schweiz erhebt 8,1% MwSt. auf die meisten Waren. Nicht-EU-Touristen können diese beim Verlassen des Landes an der Grenze oder am Flughafen zurückfordern. Der Prozess läuft direkt zwischen dir und dem Geschäft — kein landesweiter Drittanbieter wie Global Blue nötig.",
        },
        {
          heading: "Mindestbetrag",
          body: "CHF 300 pro einzelnem Kauf (inkl. MwSt.). Dies ist eine strikte Schwelle pro Rechnung — mehrere Belege können nicht kombiniert werden.",
        },
        {
          heading: "Wer hat Anspruch",
          body: "Touristen, die nicht in der Schweiz oder im EU-Zollgebiet ansässig sind. Du musst einen Exportnachweis (gestempeltes Formular) vorlegen und die Waren innerhalb von 90 Tagen nach dem Kauf exportieren.",
        },
        {
          heading: "Bedingungen",
          body: "Waren müssen unbenutzt und zur Zollkontrolle verfügbar sein. Artikel müssen innerhalb von 90 Tagen exportiert werden. Die Erstattung wird vom Geschäft verarbeitet, nicht von einer Regierungsbehörde.",
        },
        {
          heading: "So beantragen",
          body: "1. Bitte das Geschäft beim Kauf um ein unterzeichnetes Ausfuhrdokument. 2. An der Schweizer Grenze oder am Flughafen Waren + Dokument dem Zoll vorlegen — dieser stempelt es. 3. Das gestempelte Dokument per Post oder persönlich an das Geschäft zurückschicken, um die Erstattung per Karte oder Bargeld zu erhalten.",
        },
      ],
    },
  },
  USD: {
    en: {
      title: "Sales Tax in the USA",
      sections: [
        {
          heading: "No federal refund",
          body: "The United States has no national VAT system and no federal tourist tax refund program. The U.S. Customs and Border Protection officially states: \"The United States Government does not refund sales tax to foreign visitors.\"",
        },
        {
          heading: "State sales tax",
          body: "Each state sets its own sales tax rate (0–13%). When you check out in the USA, the tax is added on top of the displayed price and is generally non-refundable.",
        },
        {
          heading: "Tax-free states",
          body: "Five states charge no sales tax at all: Delaware, Montana, New Hampshire, Oregon, and (most goods) Alaska. Shopping in these states is inherently tax-free.",
        },
        {
          heading: "Texas exception",
          body: "Texas has a limited refund program for international visitors through licensed operators (e.g. taxfreetexas.com). Purchases must be made at participating stores and the goods must leave the USA via a Texas exit point.",
        },
      ],
    },
    de: {
      title: "Umsatzsteuer in den USA",
      sections: [
        {
          heading: "Kein bundesweites Refund",
          body: "Die Vereinigten Staaten haben kein nationales Mehrwertsteuersystem und kein bundesweites Touristensteuer-Erstattungsprogramm. U.S. Customs and Border Protection erklärt offiziell: \"Die US-Regierung erstattet Ausländern keine Umsatzsteuer.\"",
        },
        {
          heading: "Bundesstaatliche Umsatzsteuer",
          body: "Jeder Bundesstaat legt seinen eigenen Umsatzsteuersatz fest (0–13%). An der Kasse in den USA wird die Steuer zum angezeigten Preis addiert und ist in der Regel nicht erstattungsfähig.",
        },
        {
          heading: "Steuerfreie Bundesstaaten",
          body: "Fünf Bundesstaaten erheben gar keine Umsatzsteuer: Delaware, Montana, New Hampshire, Oregon und (auf die meisten Waren) Alaska. Einkaufen in diesen Staaten ist von Natur aus steuerfrei.",
        },
        {
          heading: "Ausnahme Texas",
          body: "Texas hat ein begrenztes Erstattungsprogramm für internationale Besucher über lizenzierte Betreiber (z.B. taxfreetexas.com). Einkäufe müssen in teilnehmenden Geschäften getätigt werden und die Waren müssen die USA über einen Texas-Ausgangspunkt verlassen.",
        },
      ],
    },
  },
  GBP: {
    en: {
      title: "VAT Refund in the UK",
      sections: [
        {
          heading: "Abolished in 2021",
          body: "The UK scrapped its tourist VAT refund scheme (\"Tax Free Shopping\") on 1 January 2021 following Brexit. Previously, non-EU tourists could reclaim 20% VAT on purchases — this is no longer available.",
        },
        {
          heading: "Current situation",
          body: "As of 2026, there is no VAT refund scheme available to tourists in England, Scotland, or Wales. Northern Ireland follows different rules due to its unique post-Brexit status, but refunds there are also not generally accessible to tourists.",
        },
        {
          heading: "Possible future changes",
          body: "There have been political discussions about reinstating a form of tourist tax refund in the UK to boost retail tourism. As of April 2026 no scheme has been reintroduced. Check GOV.UK for the latest updates before your trip.",
        },
        {
          heading: "Tip",
          body: "If you are shopping in the UK, focus on price comparisons rather than expecting a tax refund. Some duty-free shops at airports still offer tax-free prices on certain goods for travelers departing the UK.",
        },
      ],
    },
    de: {
      title: "MwSt.-Erstattung im Vereinigten Königreich",
      sections: [
        {
          heading: "Abgeschafft 2021",
          body: "Das UK hat sein Touristen-MwSt.-Erstattungssystem ('Tax Free Shopping') am 1. Januar 2021 nach dem Brexit abgeschafft. Zuvor konnten Nicht-EU-Touristen 20% MwSt. auf Einkäufe zurückfordern — das ist nicht mehr möglich.",
        },
        {
          heading: "Aktuelle Situation",
          body: "Stand 2026 gibt es kein MwSt.-Erstattungssystem für Touristen in England, Schottland oder Wales. Nordirland hat aufgrund seines einzigartigen Post-Brexit-Status andere Regelungen, aber Erstattungen sind dort für Touristen ebenfalls nicht allgemein zugänglich.",
        },
        {
          heading: "Mögliche zukünftige Änderungen",
          body: "Es gab politische Diskussionen über die Wiedereinführung einer Touristensteuervergünstigung im UK zur Stärkung des Einzelhandelstourismus. Stand April 2026 wurde kein System wiedereingeführt. Bitte GOV.UK vor deiner Reise auf aktuelle Informationen prüfen.",
        },
        {
          heading: "Tipp",
          body: "Beim Einkaufen im UK lieber Preise vergleichen, als eine Steuererstattung zu erwarten. Einige Duty-Free-Shops an Flughäfen bieten weiterhin steuerfreie Preise auf bestimmte Waren für abreisende Reisende an.",
        },
      ],
    },
  },
};

function TaxFreeInfoModal({ isOpen, onClose, language }: Props) {
  const { currency, config } = useCurrency();
  const { theme } = config;
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setRendered(false), 340);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!rendered) return null;

  const info = INFO[currency]?.[language];
  if (!info) return null;

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
        className="absolute left-3 right-3 rounded-3xl flex flex-col overflow-hidden"
        style={{
          background: config.theme.bgCard,
          maxHeight: "88dvh",
          top: "50%",
          transform: visible ? "translateY(-50%) scale(1)" : "translateY(-44%) scale(0.94)",
          opacity: visible ? 1 : 0,
          transition: visible
            ? "transform 0.44s cubic-bezier(0.22,1,0.36,1), opacity 0.28s ease"
            : "transform 0.3s cubic-bezier(0.4,0,1,1), opacity 0.22s ease",
          boxShadow: "0 12px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${theme.borderLight}` }}
        >
          <h2 className="text-[15px] font-semibold tracking-wide text-[#1A1A1A] pr-4">{info.title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: theme.bgAccent, color: theme.textSubtle }}
          >
            <span className="text-[13px]">✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {info.sections.map((section, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: theme.primary }} />
                <p className="text-[12px] font-bold tracking-widest uppercase" style={{ color: theme.primary }}>
                  {section.heading}
                </p>
              </div>
              <p className="text-[13px] leading-relaxed pl-3.5" style={{ color: theme.textMuted }}>
                {section.body}
              </p>
            </div>
          ))}
          <div
            className="rounded-xl px-4 py-3 mt-2"
            style={{ background: theme.bgAccent, border: `1px solid ${theme.border}` }}
          >
            <p className="text-[11px] leading-relaxed" style={{ color: theme.textSubtle }}>
              {language === "de"
                ? "Diese Informationen dienen nur als Orientierung. Steuergesetze können sich ändern. Bitte prüfe die aktuellen Regeln vor deiner Reise."
                : "This information is for guidance only. Tax laws may change. Please verify current rules before your trip."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaxFreeInfoModal;
