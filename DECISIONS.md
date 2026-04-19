# Architectuurkeuzes — EV of Nee?

## Geen backend
Alle berekeningen client-side. RDW API is publiek en CORS-open.
Voordeel: geen hosting-overhead, geen privacy-risico (geen gebruikersdata op server).
Nadeel: prijsdata (benzine, stroom) moet gebruiker zelf invoeren of wordt hardcoded als default.

## Zustand i.p.v. Redux
App heeft geen complexe async flows die Redux rechtvaardigen.
Zustand is minimalistisch, heeft uitstekende persist-middleware, en past in de React 18 patterns.

## Recharts i.p.v. Chart.js
Betere React-integratie (declaratieve componenten vs. imperatieve canvas-API).
Nadeel: minder flexibel voor volledig custom shapes, maar voldoende voor lijn- en staafgrafieken.

## Wizard i.p.v. single-page form
Gebruiksvriendelijker op mobiel. Vermindert cognitive load.
State wordt per stap opgeslagen in Zustand — gebruiker kan altijd terug.

## Tailwind CSS v4
Gekozen voor snelheid van ontwikkeling en consistentie.
v4 (via @tailwindcss/vite) heeft geen aparte config nodig — minder boilerplate dan v3.

## LocalStorage i.p.v. cookie
LocalStorage heeft meer opslagruimte (5MB vs. 4KB) en is eenvoudiger te beheren.
Geen server-side cookie parsing nodig. Nadeel: werkt niet cross-device.

## URL-sharing (Fase 2)
State serialiseren naar base64 query param (?s=...) voor deelbare berekeningen.
Nog niet geïmplementeerd — backlog Fase 2.
