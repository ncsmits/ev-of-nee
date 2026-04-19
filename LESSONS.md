# Lessons Learned — EV of Nee?

## RDW API

- Endpoint basisdata voertuig:
  `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=XX000X`
  Kenteken aanleveren ZONDER koppeltekens, HOOFDLETTERS. Bijv. "GH123B" niet "GH-123-B".

- Brandstofverbruik staat in APARTE endpoint:
  `https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=XX000X`
  Veld: `brandstofverbruik_gecombineerd` — let op: soms als string, soms leeg voor oudere voertuigen.

- CORS is open — direct aanroepbaar vanuit browser, geen proxy nodig.

- **`brandstof_omschrijving` bestaat NIET in het basisdataset `m9d7-ebf2`** — dit veld is alleen
  beschikbaar in het brandstof-dataset `8ys7-d773`. Altijd beide fetchen en brandstoftype uit de
  fuel-dataset halen. Fout: `No such column: brandstof_omschrijving` bij filteren op het basisdataset.

- Catalogusprijs is de nieuwprijs inclusief BTW, exclusief opties.
  Niet beschikbaar voor alle voertuigen (met name grijskentekens).

- `datum_eerste_toelating` format is `YYYYMMDD` als string → parsen met
  `new Date(raw.slice(0,4), raw.slice(4,6)-1, raw.slice(6,8))`

- EV-kenteken check: `isElectric` altijd bepalen via `fuel.brandstof_omschrijving` (niet `base`).
  Waarde voor EV's is "Elektriciteit".

## Tailwind CSS v4

- Gebruik `@tailwindcss/vite` plugin in `vite.config.js` — NIET de PostCSS config.
  PostCSS geeft conflicten met Vite v4+.
- Import in CSS: `@import "tailwindcss"` (niet de oude `@tailwind base` syntax)

## Zustand

- Gebruik `persist` middleware uit `zustand/middleware` voor LocalStorage.
  Niet zelf serialiseren — persist regelt dat automatisch.
- Bij React StrictMode kan rehydration een render cycle te vroeg triggeren.
  Oplossing: check `useAppStore.persist.hasHydrated()` voor render van wizard.
- **`const` vs `let` in Zustand actions**: als een variabele opnieuw toegewezen wordt binnen een
  setter (bijv. bij herbalanceren laadprofiel), moet het `let` zijn, niet `const`.

## MRB-berekening

- MRB-tarieven 2025 zijn per kwartaal, per 100kg gewicht, per brandstoftype.
  Dieseltoeslag geldt apart. Provincie-opslag is gemiddeld ~96%.
- EV is volledig vrijgesteld t/m 2024. Vanaf 2025 geleidelijke afbouw:
  2025: 25% van normaltarief, 2026: 50%, etc. (meenemen in meerjarenberekening)
- **MRB-afbouw maakt EV-kosten niet-lineair**: de grafiek stijgt elk jaar iets meer totdat MRB
  op 100% is gestabiliseerd (2028). Tabel toont gemiddelde over bezitsduur om verwarring te
  voorkomen.

## Berekeningen

- Break-even: cumulatieve kosten ICE vs. EV plotten per jaar (niet per maand — te granulaar).
  Verkoopwaarde huidig voertuig verrekenen als negatieve startkosten EV (switchCost).
- TCO bevat: brandstof/laad, onderhoud, verzekering, MRB, laadpaal (eenmalig). Aanschafprijzen
  worden apart verrekend in de break-even grafiek.
- **Grafiek Jaar 0**: EV-lijn begint hoog (switchCost + wallboxNet) zodat de initiële investering
  zichtbaar is. ICE-lijn begint op 0. Kruispunt = break-even jaar.
- **Break-even maandprecisie**: lineaire interpolatie tussen het jaar voor en na break-even.
  Extrapolatie voorbij bezitsduur: gebruik vaste jaarkosten van het laatste jaar (MRB gestabiliseerd).
- **Numerieke X-as in Recharts**: gebruik `type="number"` op XAxis zodat ReferenceLine op een
  decimale x-waarde (bijv. 2.67) kan staan. Categorische as (`type="category"`) ondersteunt dit niet.

## Brandstofprijzen (NL gemiddeld, april 2026)

- Benzine E10: €2,32/liter
- Diesel: €2,53/liter
- LPG (autogas): €1,05/liter
- Bron: globalpetrolprices.com — maandelijks verifiëren en bijwerken in `useAppStore.js`.

## Subsidies

- SEPP (aanschafsubsidie particulieren) is per 2026 afgeschaft — niet meer tonen in de UI.
