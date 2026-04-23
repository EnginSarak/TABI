export type Language = "en" | "de";

export const translations = {
  en: {
    appTitle: "Tabi Currency Converter",
    updated: "Updated",
    loading: "Loading...",
    cardProvider: "Card Type",
    taxAdjustment: "Tax",
    amountIn: "Amount in",
    switchDirection: "Switch Direction",
    rate: "Rate",
    resetRate: "Return to automatic rate",
    yourShoppingList: "Your Shopping List",
    listEmpty: "Your list is empty",
    item: "Item",
    totalJPY: "Total JPY:",
    totalEUR: "Total EUR:",
    supportProject: "Support this project with a coffee ☕",
    close: "Close",
    netto: "Netto",
    tax: "+10% Tax",
  },
  de: {
    appTitle: "Tabi Currency Converter",
    updated: "Aktualisiert",
    loading: "Lädt...",
    cardProvider: "Karten-Anbieter",
    taxAdjustment: "Steuer",
    amountIn: "Betrag in",
    switchDirection: "Richtung wechseln",
    rate: "Kurs",
    resetRate: "Zum automatischen Kurs zurückkehren",
    yourShoppingList: "Deine Einkaufsliste",
    listEmpty: "Deine Liste ist leer",
    item: "Artikel",
    totalJPY: "Gesamt JPY:",
    totalEUR: "Gesamt EUR:",
    supportProject: "Unterstütze dieses Projekt mit einem Kaffee ☕",
    close: "Schließen",
    netto: "Netto",
    tax: "+10% Tax",
  },
};

export function getTranslation(lang: Language, key: keyof typeof translations.en): string {
  return translations[lang][key];
}
