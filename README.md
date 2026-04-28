# TABI

EUR ↔ JPY currency converter. Uses real card network rates instead of the mid-market rate, has a shopping list so you can track a basket of items, and a cash budget tracker.

---

## The rate problem

Every card network applies its own markup on top of the mid-market rate. Showing you the ECB rate is useless if you're paying with a Visa. TABI calculates what you'll actually see on your statement:

| Provider | Markup |
|---|---|
| Mastercard | 0.45% |
| Visa | 0.55% |
| Amex | 2.5% |

Rates are fetched from [open.er-api.com](https://open.er-api.com) once a day and cached locally. If you're offline, it uses whatever it last saw.

---

## Features

**Shopping list** — Add items as you walk around a store. Running EUR total at the bottom. Save sessions to history, start fresh for the next shop.

**Cash tracker** — Set a JPY budget, tap "Spend" after each purchase. Progress bar, remaining balance, link to nearest ATM when you inevitably run out.

**Discount presets** — 10 / 20 / 30 / 半額 50% / 70%, plus a custom slider. Japan loves a sale.

**Tax-free mode** — Purchases over ¥5,500 qualify for the airport VAT refund. Toggle it on and TABI removes the 10% from the result.

**Manual rate override** — Lock in your own rate if you want. Useful if you already exchanged cash somewhere.

**EN / DE** — I'm German. Both languages are in there.

---

## Stack

React + TypeScript, Tailwind, shadcn/ui, Vite, Express for static serving. Nothing exotic.

---

## Run it

```bash
git clone https://github.com/your-username/tabi.git
cd tabi && npm install
cd client && npm install && cd ..
npm run dev
```

`http://localhost:5173`

```bash
# build
cd client && npm run build
```

---

## Structure

```
client/src/
├── components/
│   ├── CurrencyConverter.tsx   # main shell
│   ├── ConversionDisplay.tsx   # the rolling number animation
│   ├── ShoppingList.tsx        # list + history
│   ├── ProviderToggle.tsx      # mastercard / visa / amex picker
│   └── ExchangeRateDisplay.tsx # rate + manual override
└── lib/
    ├── api.ts          # fetch + cache exchange rate
    ├── storage.ts      # localStorage helpers + usePersistentState
    ├── formatter.ts    # number formatting
    └── translations.ts # en/de strings
```

---

## License

MIT
