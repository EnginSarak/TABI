export type ForeignCurrency = "JPY" | "USD" | "GBP" | "TRY" | "CHF";

export interface CurrencyTheme {
  primary: string;
  primaryHover: string;
  bg: string;
  bgCard: string;
  bgInput: string;
  bgAccent: string;
  border: string;
  borderLight: string;
  textMuted: string;
  textSubtle: string;
}

export interface CurrencyConfig {
  code: ForeignCurrency;
  symbol: string;
  symbolBefore?: boolean;
  flag: string;
  nameEN: string;
  nameDE: string;
  decimals: number;
  theme: CurrencyTheme;
  taxFreeMin?: number;
}

const neutralLayout = {
  bg: "#F0EDE6",
  bgCard: "#FFFFFF",
  bgInput: "#FAF9F6",
  bgAccent: "#EAE6DE",
  border: "#D4CEBC",
  borderLight: "#E8E3D9",
  textMuted: "#6B6560",
  textSubtle: "#9B948A",
};

export const CURRENCIES: Record<ForeignCurrency, CurrencyConfig> = {
  JPY: {
    code: "JPY", symbol: "¥", flag: "🇯🇵",
    nameEN: "Japanese Yen", nameDE: "Japanischer Yen",
    decimals: 0,
    theme: { primary: "#1B2A4A", primaryHover: "#243660", ...neutralLayout },
    taxFreeMin: 5500,
  },
  USD: {
    code: "USD", symbol: "$", flag: "🇺🇸", symbolBefore: true,
    nameEN: "US Dollar", nameDE: "US-Dollar",
    decimals: 2,
    theme: { primary: "#1A4D3A", primaryHover: "#22624A", ...neutralLayout },
  },
  GBP: {
    code: "GBP", symbol: "£", flag: "🇬🇧", symbolBefore: true,
    nameEN: "British Pound", nameDE: "Britisches Pfund",
    decimals: 2,
    theme: { primary: "#3D1A6E", primaryHover: "#4E2285", ...neutralLayout },
  },
  TRY: {
    code: "TRY", symbol: "₺", flag: "🇹🇷",
    nameEN: "Turkish Lira", nameDE: "Türkische Lira",
    decimals: 2,
    theme: { primary: "#7A1A1A", primaryHover: "#962020", ...neutralLayout },
  },
  CHF: {
    code: "CHF", symbol: "Fr", flag: "🇨🇭",
    nameEN: "Swiss Franc", nameDE: "Schweizer Franken",
    decimals: 2,
    theme: { primary: "#5D6D7E", primaryHover: "#4A5664", ...neutralLayout },
  },
};
