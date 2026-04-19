# EV of Nee? ⚡

Nederlandse web-app voor TCO-vergelijking tussen jouw huidige benzine/dieselauto en een elektrische auto.

**Live:** [github.com/ncsmits/ev-of-nee](https://github.com/ncsmits/ev-of-nee)

## Wat doet het?

Voer je kenteken in → de app haalt voertuigdata op via de RDW Open Data API → een 5-stappen wizard begeleidt je door kosten → vergelijking met break-even grafiek en TCO-tabel.

Berekent: brandstof/laadkosten, MRB (incl. EV-afbouwregeling 2025–2028), onderhoud, verzekering, laadpaal, en break-even met maandprecisie.

## Snel starten

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Projectstructuur

```
src/
├── api/rdw.js              # RDW Open Data API (kentekenlookup)
├── store/useAppStore.js    # Zustand state + LocalStorage persistentie
├── utils/calculations.js  # TCO-rekenlogica (pure functions)
└── components/
    ├── layout/             # Header, LandingPage
    ├── wizard/             # Wizard-shell + voortgangsbalk
    ├── steps/              # Step1 t/m Step5
    └── ui/                 # FieldRow, StepShell, FeedbackButton, etc.
```

## Features

- **RDW-integratie** — kenteken opzoeken, voertuigdata automatisch ingevuld
- **TCO-vergelijking** — alle kosten over de bezitsduur naast elkaar
- **Break-even grafiek** — Recharts lijndiagram met maandprecisie
- **MRB EV-afbouw** — rekening gehouden met de geleidelijke afbouw 2025–2028
- **Dark mode** — automatisch op basis van OS-voorkeur
- **Landing page** — uitleg en CTA voor eerste bezoekers
- **LocalStorage** — invoer wordt bewaard bij paginaverversing
- **Feedback** — mailto-knop in de header

## Claude Code werken

Zie `CLAUDE.md` voor instructies aan Claude.
Zie `PROGRESS.md` voor de huidige status.
Zie `LESSONS.md` voor debuglog en bekende valkuilen.
Zie `DECISIONS.md` voor architectuurkeuzes.

## Tech stack

- React 18 + Vite
- Tailwind CSS v4 (via @tailwindcss/vite — geen PostCSS)
- Zustand (state + LocalStorage via persist middleware)
- Recharts (break-even grafiek)
- RDW Open Data API (gratis, geen authenticatie, CORS open)
