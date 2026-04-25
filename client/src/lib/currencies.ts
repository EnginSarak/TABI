export type ForeignCurrency = "JPY" | "CHF" | "USD" | "GBP" | "TRY";

export interface CurrencyTheme {
  primary: string;
  primaryHover: string;
  bg: string;
  bgAlt: string;
  bgCard: string;
  border: string;
  borderAlt: string;
  textMuted: string;
  textFaint: string;
}

export interface CurrencyConfig {
  code: ForeignCurrency;
  symbol: string;
  name: string;
  nameDE: string;
  flag: string;
  theme: CurrencyTheme;
  decimals: number;
  isJapan: boolean;
}

export const CURRENCIES: Record<ForeignCurrency, CurrencyConfig> = {
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    nameDE: "Japanischer Yen",
    flag: "🇯🇵",
    theme: {
      primary: "#1B2A4A",
      primaryHover: "#243660",
      bg: "#F0EDE6",
      bgAlt: "#EAE6DE",
      bgCard: "#FAF9F6",
      border: "#D4CEBC",
      borderAlt: "#E8E3D9",
      textMuted: "#6B6560",
      textFaint: "#9B948A",
    },
    decimals: 0,
    isJapan: true,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    nameDE: "US-Dollar",
    flag: "🇺🇸",
    theme: {
      primary: "#1A4831",
      primaryHover: "#215C3E",
      bg: "#EDF3EE",
      bgAlt: "#E2EDE4",
      bgCard: "#F6FAF6",
      border: "#B8D4BC",
      borderAlt: "#D0E4D3",
      textMuted: "#4A6B52",
      textFaint: "#7A9E82",
    },
    decimals: 2,
    isJapan: false,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    nameDE: "Britisches Pfund",
    flag: "🇬🇧",
    theme: {
      primary: "#3B1A6B",
      primaryHover: "#4C2480",
      bg: "#F2EFF8",
      bgAlt: "#EAE3F4",
      bgCard: "#FAF7FF",
      border: "#CEC0DC",
      borderAlt: "#DDD4EC",
      textMuted: "#6B5880",
      textFaint: "#9B8AAD",
    },
    decimals: 2,
    isJapan: false,
  },
  TRY: {
    code: "TRY",
    symbol: "₺",
    name: "Turkish Lira",
    nameDE: "Türkische Lira",
    flag: "🇹🇷",
    theme: {
      primary: "#8B1E24",
      primaryHover: "#A3242B",
      bg: "#F6EDEE",
      bgAlt: "#EEE0E1",
      bgCard: "#FDF6F6",
      border: "#DCC0C2",
      borderAlt: "#EDD8D9",
      textMuted: "#7A4A4C",
      textFaint: "#A87A7C",
    },
    decimals: 2,
    isJapan: false,
  },
  CHF: {
    code: "CHF",
    symbol: "Fr.",
    name: "Swiss Franc",
    nameDE: "Schweizer Franken",
    flag: "🇨🇭",
    theme: {
      primary: "#7A5C14",
      primaryHover: "#8F6C1A",
      bg: "#F6F1E6",
      bgAlt: "#EDE5D3",
      bgCard: "#FAF7EE",
      border: "#D4C496",
      borderAlt: "#E3D9BC",
      textMuted: "#7A6640",
      textFaint: "#A89060",
    },
    decimals: 2,
    isJapan: false,
  },
};

export function isValidCurrency(code: unknown): code is ForeignCurrency {
  return typeof code === "string" && code in CURRENCIES;
}
