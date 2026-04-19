# EV of Nee? ⚡

Nederlandse web-app voor TCO-vergelijking tussen jouw huidige benzine/dieselauto en een elektrische auto.

## Snel starten

```bash
# 1. Dependencies installeren
npm install

# 2. Dev server starten
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
    ├── layout/             # Header
    ├── wizard/             # Wizard-shell + voortgangsbalk
    ├── steps/              # Step1 t/m Step5
    └── ui/                 # Herbruikbare UI-elementen
```

## Claude Code werken

Zie `CLAUDE.md` voor instructies aan Claude.  
Zie `PROGRESS.md` voor de huidige status.  
Zie `LESSONS.md` voor debuglog en bekende valkuilen.  
Zie `DECISIONS.md` voor architectuurkeuzes.

## Tech stack

- React 18 + Vite
- Tailwind CSS v4
- Zustand (state + LocalStorage)
- Recharts (grafieken)
- RDW Open Data API (gratis, geen auth)
