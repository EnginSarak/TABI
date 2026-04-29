<div align="center">

<img src="client/public/tabi-logo-horizontal.svg" alt="TABI Currency Converter" height="52"/>

**TABI Currency Converter** · v0.1.0

*Real card rates. Shopping list. Cash budget tracker. Tax-free calculator. Installable as an app.*

*By [Engin Sarak](https://github.com/EnginSarak)*

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

**[tabi-cc.vercel.app](https://tabi-cc.vercel.app)**

</div>

---

## Table of Contents

- [Why TABI?](#why-tabi)
- [Supported Currencies](#supported-currencies)
- [Features](#features)
  - [Real Card Network Rates](#real-card-network-rates)
  - [Discount Presets](#discount-presets)
  - [Tax-Free Mode](#tax-free-mode)
  - [Shopping List](#shopping-list)
  - [Cash Budget Tracker](#cash-budget-tracker)
  - [PWA — Installable](#pwa--installable)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)

---

## Why TABI?

Most currency converters show you a number and stop there. TABI is built around what actually happens when you spend money abroad.

The mid-market rate you see on Google is the interbank rate — no card provider passes that on to you. Mastercard, Visa, and Amex each apply their own markup before it hits your statement. TABI factors that in upfront, so the number you see is the number you pay.

Beyond the rate, TABI covers what other converters don't touch at all:

- **No mental math while shopping** — the shopping list tracks your basket, running total in both currencies included
- **Sale prices, correctly converted** — apply a discount percentage before converting, not after
- **Cash stays accountable** — set a daily cash budget and log each purchase against it
- **Tax-free thresholds** — know instantly whether a purchase qualifies for a VAT refund, and by how much

No account required. No ads. No backend beyond a daily rate fetch from a free public API.

---

## Supported Currencies

EUR is always the home currency. Conversion works in both directions — switch with one tap, and the amount stays in the field.

| Currency | Code | Tax-Free |
|---|---|---|
| Japanese Yen | JPY | above ¥5,500 (10% VAT) |
| US Dollar | USD | no federal scheme |
| British Pound | GBP | abolished post-Brexit |
| Turkish Lira | TRY | above ₺1,200 (20% VAT) |
| Swiss Franc | CHF | above Fr. 300 (8.1% VAT) |

Each currency comes with its own color theme, correct decimal handling (JPY is integer-only), and either a tax-free calculator or an inline explanation of why the scheme doesn't apply.

---

## Features

### Real Card Network Rates

Select your card provider and TABI adjusts the conversion rate accordingly. A live ticker in the header rotates through all three providers so you can compare at a glance.

| Provider | Markup |
|---|---|
| Mastercard | 0.45% |
| Visa | 0.55% |
| American Express | 2.50% |

Rates are sourced from [open.er-api.com](https://open.er-api.com) and refreshed daily.

### Discount Presets

One-tap presets for the most common sale formats — 10%, 20%, 30%, 50%, 70% — plus a free-drag slider for anything in between. The discount is applied to the input amount before converting, so the result is always the actual price you'd pay.

### Tax-Free Mode

Toggle tax-free mode on and TABI strips the VAT from the converted result, showing you the pre-tax price and whether the purchase clears the refund threshold. For countries where the scheme doesn't apply (USD, GBP), an inline explanation is shown instead of silently hiding the feature.

| Currency | Threshold | VAT |
|---|---|---|
| JPY | ¥5,500 | 10% |
| TRY | ₺1,200 | 20% |
| CHF | Fr. 300 | 8.1% |

### Shopping List

Add items to a running list as you shop. Each entry stores the foreign amount and its EUR equivalent at the current rate. The list shows a live total in both currencies. When done, save the session to history and start a fresh list.

### Cash Budget Tracker

Set a cash budget in the foreign currency and tap **Spend** after each purchase. TABI subtracts it from your remaining balance and shows a progress bar. A **Find ATM** button is available when the balance runs low. Budgets are stored per currency so switching destinations doesn't reset your data.

### PWA — Installable

TABI is a Progressive Web App. On iOS, a native-style prompt walks you through Share → Add to Home Screen. On Android, the standard Chrome install prompt is triggered. Once installed, the app runs without browser chrome, handles safe-area insets correctly on notched devices, and behaves like a native app.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| Components | Radix UI primitives + shadcn/ui |
| Icons | Lucide React |
| Exchange Rates | open.er-api.com (free tier, daily updates) |
| Persistence | localStorage (no backend, no accounts) |
| Hosting | Vercel |

---

## Project Structure

```
TABI-main/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── public/
│   │   ├── tabi-logo-horizontal.svg
│   │   ├── tabi-logo-horizontal-dark.svg
│   │   ├── tabi-icon.svg / .png
│   │   ├── logos/                        Mastercard, Visa, Amex SVGs (color + white)
│   │   └── sw.js                         Service Worker
│   └── src/
│       ├── App.tsx                        Root — dark mode, language, currency context
│       ├── contexts/
│       │   ├── CurrencyContext.tsx        Active currency + theme provider
│       │   └── LanguageContext.tsx        EN / DE language provider
│       ├── components/
│       │   ├── CurrencyConverter.tsx      Main app shell
│       │   ├── ConversionDisplay.tsx      Animated rolling number output
│       │   ├── ProviderToggle.tsx         Mastercard / Visa / Amex selector
│       │   ├── ExchangeRateDisplay.tsx    Live rate + manual override input
│       │   ├── ShoppingList.tsx           List, history, totals
│       │   ├── SettingsModal.tsx          Language + currency switcher
│       │   ├── TaxFreeInfoModal.tsx       Tax-free explainer sheet
│       │   ├── ChfSymbol.tsx              Custom SVG for the CHF symbol
│       │   ├── DarkModeToggle.tsx
│       │   ├── FlagIcon.tsx
│       │   ├── Footer.tsx
│       │   └── ui/                        shadcn/ui base components
│       └── lib/
│           ├── api.ts                     Rate fetch + localStorage cache
│           ├── currencies.ts              Currency configs, themes, tax rules
│           ├── formatter.ts               Number formatting (de-DE locale)
│           ├── storage.ts                 localStorage helpers + usePersistentState
│           └── translations.ts            EN / DE string map
└── server/                                Minimal Express static server (optional)
```

---

<div align="center">

*By [Engin Sarak](https://github.com/EnginSarak)*

</div>
