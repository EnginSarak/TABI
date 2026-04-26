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

export const CURRENCIES: Record<ForeignCurrency, CurrencyConfig> = {
  JPY: {
    code: "JPY", symbol: "¥", flag: "🇯🇵",
    nameEN: "Japanese Yen", nameDE: "Japanischer Yen",
    decimals: 0,
    theme: {
      primary: "#1B2A4A", primaryHover: "#243660",
      bg: "#F0EDE6", bgCard: "#FFFFFF", bgInput: "#FAF9F6", bgAccent: "#EAE6DE",
      border: "#D4CEBC", borderLight: "#E8E3D9",
      textMuted: "#6B6560", textSubtle: "#9B948A",
    },
    taxFreeMin: 5500,
  },
  USD: {
    code: "USD", symbol: "$", flag: "🇺🇸", symbolBefore: true,
    nameEN: "US Dollar", nameDE: "US-Dollar",
    decimals: 2,
    theme: {
      primary: "#1A4D3A", primaryHover: "#22624A",
      bg: "#EDF2EE", bgCard: "#FFFFFF", bgInput: "#F4F8F5", bgAccent: "#E2EDE5",
      border: "#BDD0C4", borderLight: "#D8E8DC",
      textMuted: "#3D5C4A", textSubtle: "#6A8C78",
    },
  },
  GBP: {
    code: "GBP", symbol: "£", flag: "🇬🇧", symbolBefore: true,
    nameEN: "British Pound", nameDE: "Britisches Pfund",
    decimals: 2,
    theme: {
      primary: "#3D1A6E", primaryHover: "#4E2285",
      bg: "#EEE8F5", bgCard: "#FFFFFF", bgInput: "#F7F3FC", bgAccent: "#E4DAEF",
      border: "#C9B8E0", borderLight: "#DDD4EE",
      textMuted: "#5A4578", textSubtle: "#8B78A8",
    },
  },
  TRY: {
    code: "TRY", symbol: "₺", flag: "🇹🇷",
    nameEN: "Turkish Lira", nameDE: "Türkische Lira",
    decimals: 2,
    theme: {
      primary: "#7A1A1A", primaryHover: "#962020",
      bg: "#F5EAEA", bgCard: "#FFFFFF", bgInput: "#FDF5F5", bgAccent: "#EDD8D8",
      border: "#DDB8B8", borderLight: "#EDD4D4",
      textMuted: "#6B3A3A", textSubtle: "#9B6A6A",
    },
  },
  CHF: {
    code: "CHF", symbol: "Fr", flag: "🇨🇭",
    nameEN: "Swiss Franc", nameDE: "Schweizer Franken",
    decimals: 2,
    theme: {
      primary: "#5C4200", primaryHover: "#7A5800",
      bg: "#F5F0E0", bgCard: "#FFFFFF", bgInput: "#FAF6EA", bgAccent: "#EDE3C5",
      border: "#D4C490", borderLight: "#E8DFB8",
      textMuted: "#6B5A30", textSubtle: "#9B8A60",
    },
  },
};
