# EV of Nee? — Claude Code Instructions

## Project doel
Nederlandse web-app voor TCO-vergelijking tussen huidig ICE-voertuig en overstap naar EV
(nieuw of tweedehands). Gebruiker voert kenteken in → app haalt voertuigdata op → wizard
begeleidt door kosten → vergelijking + break-even grafiek.

## Stack
- React 18 + Vite
- Tailwind CSS v4 (via @tailwindcss/vite plugin — NIET PostCSS)
- Zustand (state + localStorage persistentie via persist middleware)
- Recharts (grafieken)
- Taal UI: **Nederlands**
- Code en comments: **Engels**

## Mapstructuur
```
src/
├── api/
│   └── rdw.js          # RDW Open Data API calls
├── store/
│   └── useAppStore.js  # Zustand store (alle gebruikersinvoer + hasStarted flag)
├── utils/
│   └── calculations.js # Alle rekenlogica (pure functions)
├── components/
│   ├── layout/         # Header, LandingPage
│   ├── wizard/         # Wizard-shell + voortgangsbalk (klikbare voltooide stappen)
│   ├── steps/          # Één component per stap (Step1–Step5)
│   └── ui/             # StepShell, FieldRow, FeedbackButton, ChargingProfileEditor, etc.
└── App.jsx             # Toont LandingPage als !hasStarted, anders Wizard
```

## Architectuurregels (ALTIJD volgen)
1. Alle rekenlogica staat in `src/utils/calculations.js` — NOOIT in componenten
2. Alle API-calls staan in `src/api/` — NOOIT inline in componenten
3. Alle globale state staat in Zustand store — NOOIT losse useState voor gedeelde data
4. Laadprofiel-percentages moeten altijd optellen tot 100 (validatie in store + UI)
5. Kenteken altijd opslaan zonder koppeltekens, hoofdletters (bijv. "XX000X")

## RDW API
Basis-endpoint voertuigdata:
```
https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken={KENTEKEN}
```
Geen authenticatie nodig. CORS is open — direct vanuit browser aanroepbaar.
Kenteken aanleveren: GEEN koppeltekens, hoofdletters.

Relevante velden:
- `merk` — automerk
- `handelsbenaming` — model
- `datum_eerste_toelating` — bouwjaar (format: YYYYMMDD)
- `massa_rijklaar` — gewicht in kg (voor MRB-berekening)
- `brandstof_omschrijving` — brandstoftype
- `catalogusprijs` — nieuwprijs
- `co2_uitstoot_gecombineerd` — CO2 g/km

Brandstofverbruik staat in aparte endpoint:
```
https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken={KENTEKEN}
```
Veld: `brandstofverbruik_gecombineerd` (in L/100km — soms als string)

## LocalStorage
Key: `ev-of-nee-v1`
Beheerd via Zustand persist middleware — niet handmatig serialiseren.

## Wizard stappen
1. **Huidig voertuig** — kentekenlookup + basisgegevens ICE
2. **Gebruiksprofiel** — jaarlijkse km, laadprofiel EV
3. **EV-keuze** — nieuw/tweedehands, kenteken of model kiezen
4. **Kosten & financiering** — budget, laadpaal, subsidies
5. **Resultaat** — TCO-vergelijking, break-even grafiek

## Huidige fase
→ Zie PROGRESS.md

## Bekende valkuilen
→ Zie LESSONS.md

## Zelfonderhoud (voor Claude)
Na elke sessie:
1. Vink af in PROGRESS.md wat klaar is, voeg toe wat open staat
2. Voeg toe aan LESSONS.md als er iets niet-voor-de-hand-liggends is geleerd
3. Stel een commit message voor die de sessie dekt
