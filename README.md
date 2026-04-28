<div align="center">

<img src="client/public/tabi-logo-horizontal.svg" alt="TABI Currency Converter" height="52"/>

# TABI

**Currency Converter for Travellers** · v0.1.0

*Real card rates. Shopping list for supermarket runs. Cash budget tracker. Tax-free calculator. Offline-ready. Installable as an app.*

*Built by [Engin Sarak](https://github.com/EnginSarak)*

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
- [Features](#features)
  - [Real Card Network Rates](#real-card-network-rates)
  - [Discount Presets](#discount-presets)
  - [Tax-Free Mode](#tax-free-mode)
  - [Shopping List](#shopping-list)
  - [Cash Budget Tracker](#cash-budget-tracker)
  - [Offline Support](#offline-support)
  - [PWA — Installable](#pwa--installable)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)

---

## Why TABI?

Open any standard currency converter and you get a number. What you don't get is context — no card markup, no discount calculation, no way to track what you've put in your basket, no cash budget, no tax-free math. You're just staring at a rate and doing the rest in your head.

TABI is built around how travel spending actually works:

- You're in a Japanese supermarket and everything has a price tag but you don't know if your basket is over ¥5,500 (the tax-free threshold) — **the shopping list tracks it item by item**
- You see a 半額 sticker — **one tap applies the 50% discount before converting**
- You want to know what ¥3,800 costs you in EUR after your Visa markup — **the card network rate is already factored in**
- You set yourself a cash budget of ¥30,000 for the day — **the cash tracker shows how much is left after each purchase**

All of this works without an account, without ads, and without internet once the rate is cached.

---

## Supported Currencies

TABI currently supports five travel currencies. EUR is always the home currency — conversion works in both directions.

| Flag | Currency | Code | Tax-Free |
|---|---|---|---|
| 🇯🇵 | Japanese Yen | JPY | ✅ above ¥5,500 (10% VAT) |
| 🇺🇸 | US Dollar | USD | ❌ no federal scheme |
| 🇬🇧 | British Pound | GBP | ❌ abolished post-Brexit |
| 🇹🇷 | Turkish Lira | TRY | ✅ above ₺1,200 (20% VAT) |
| 🇨🇭 | Swiss Franc | CHF | ✅ above Fr. 300 (8.1% VAT) |

Each currency has its own color theme, correct decimal handling (JPY is integer-only), and currency-specific tax-free rules or explanation.

---

## Why Not Just Use Google?

| Provider | Markup Applied |
|---|---|
| Mastercard | 0.45% |
| Visa | 0.55% |
| American Express | 2.50% |

## Why Not Just Use Google?

Google shows you the mid-market rate — the interbank rate that no consumer ever actually gets. When you pay with a card abroad, the card network applies its own markup before it hits your statement. TABI applies that markup for you upfront.

| Provider | Markup Applied |
|---|---|
| Mastercard | 0.45% |
| Visa | 0.55% |
| American Express | 2.50% |

You pick your card, TABI shows the rate you'll actually see. A live ticker in the header cycles through all three providers so you can compare at a glance without touching anything.

Rates are fetched from [open.er-api.com](https://open.er-api.com) once per day and cached locally. If you're offline, the last known rate is used automatically.

---

## Features

### Real Card Network Rates

Pick your card provider — Mastercard, Visa, or Amex — and TABI applies the real markup before showing the result. A live ticker in the header cycles through all three so you can compare at a glance.

### Discount Presets

Preset discount buttons for the most common sale formats — 10%, 20%, 30%, 50%, 70% — plus a custom free-drag slider for anything in between. The discount is applied to the input amount before conversion, so the result always reflects what you'd actually pay after the reduction. Great for Japan's 半額 (50% off) supermarket stickers.

### Tax-Free Mode

For countries where tourist VAT refunds are available and realistic, TABI lets you toggle Tax-Free mode on. When active, the VAT rate is stripped from the converted result to show you the pre-tax equivalent — useful for planning whether a purchase actually hits the refund threshold.

| Currency | Threshold | VAT Rate |
|---|---|---|
| JPY | ¥5,500 | 10% |
| TRY | ₺1,200 | 20% |
| CHF | Fr. 300 | 8.1% |

For USD and GBP, TABI shows an inline explanation of why tax-free is unavailable rather than silently hiding the feature.

### Shopping List

Add items to a running list as you shop — each entry records the foreign amount, its EUR equivalent at the current rate, and a timestamp. The list shows a live running total in both currencies. When you're done, you can save the session to history and start a fresh list for the next store. Useful for keeping a mental budget across a full day of shopping without doing maths in your head.

### Cash Budget Tracker

Set a cash budget in the foreign currency and tap **Spend** after each purchase. TABI subtracts it from your remaining balance and shows a progress bar. When you're running low, a **Find ATM** button opens a maps search for the nearest cash machine. The budget and spent amounts are saved per currency, so switching to a different destination doesn't wipe your data.

### Offline Support

Exchange rates are cached in localStorage after the first successful fetch. On subsequent visits — including when offline — TABI loads the last known rate instantly and shows the date it was last updated. The previous day's rate is also retained so you can see whether the rate moved since yesterday.

### PWA — Installable

TABI is a Progressive Web App. On iOS, a native-style install prompt appears after a short delay, guiding you through the Share → Add to Home Screen flow. On Android, the equivalent Chrome menu prompt is shown. Once installed, TABI opens without browser chrome, behaves like a native app, and respects the safe-area insets of notched and Dynamic Island devices.

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
│   │   ├── logos/                        # Mastercard, Visa, Amex SVGs (color + white)
│   │   └── sw.js                         # Service Worker
│   └── src/
│       ├── App.tsx                        # Root — dark mode, language, currency context
│       ├── contexts/
│       │   ├── CurrencyContext.tsx        # Active currency + theme provider
│       │   └── LanguageContext.tsx        # EN / DE language provider
│       ├── components/
│       │   ├── CurrencyConverter.tsx      # Main app shell
│       │   ├── ConversionDisplay.tsx      # Animated rolling number output
│       │   ├── ProviderToggle.tsx         # Mastercard / Visa / Amex selector
│       │   ├── ExchangeRateDisplay.tsx    # Live rate + manual override input
│       │   ├── ShoppingList.tsx           # List, history, totals
│       │   ├── SettingsModal.tsx          # Language + currency switcher
│       │   ├── TaxFreeInfoModal.tsx       # Tax-free explainer sheet
│       │   ├── ChfSymbol.tsx              # Custom SVG for the CHF currency symbol
│       │   ├── DarkModeToggle.tsx
│       │   ├── FlagIcon.tsx
│       │   ├── Footer.tsx
│       │   └── ui/                        # shadcn/ui base components
│       └── lib/
│           ├── api.ts                     # Rate fetch + localStorage cache
│           ├── currencies.ts              # Currency configs, themes, tax rules
│           ├── formatter.ts               # Number formatting (de-DE locale)
│           ├── storage.ts                 # localStorage helpers + usePersistentState
│           └── translations.ts            # EN / DE string map
└── server/                                # Minimal Express static server (optional)
```

---

## Local Development

### Prerequisites

- Node.js ≥ 18
- npm

### Setup

```bash
git clone https://github.com/EnginSarak/tabi.git
cd tabi

cd client
npm install
npm run dev
```

Open `http://localhost:5173`

### Build

```bash
cd client
npm run build
```

---

<div align="center">

*Built by [Engin Sarak](https://github.com/EnginSarak)*

</div>
