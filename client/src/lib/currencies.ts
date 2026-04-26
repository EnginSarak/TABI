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
    theme: { primary: "#0F2B21", primaryHover: "#184535", ...neutralLayout },
  },
  GBP: {
    code: "GBP", symbol: "£", flag: "🇬🇧", symbolBefore: true,
    nameEN: "British Pound", nameDE: "Britisches Pfund",
    decimals: 2,
    theme: { primary: "#251142", primaryHover: "#35185E", ...neutralLayout },
  },
  TRY: {
    code: "TRY", symbol: "₺", flag: "🇹🇷",
    nameEN: "Turkish Lira", nameDE: "Türkische Lira",
    decimals: 2,
    theme: { primary: "#4A0D0D", primaryHover: "#6B1212", ...neutralLayout },
  },
  CHF: {
    code: "CHF", symbol: "Fr", flag: "🇨🇭",
    nameEN: "Swiss Franc", nameDE: "Schweizer Franken",
    decimals: 2,
    theme: { primary: "#36414D", primaryHover: "#4B5866", ...neutralLayout },
  },
};
