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
Nadeel: minder flexibel voor volledig custom shapes, maar voldoende voor lijngrafieken.
Dark mode vereist een `usePrefersDark()` hook — Tailwind `dark:` classes werken niet op inline Recharts-props.

## Wizard i.p.v. single-page form
Gebruiksvriendelijker op mobiel. Vermindert cognitive load.
State wordt per stap opgeslagen in Zustand — gebruiker kan altijd terug.
Voltooide stappen in de voortgangsbalk zijn klikbaar voor directe navigatie.

## Tailwind CSS v4
Gekozen voor snelheid van ontwikkeling en consistentie.
v4 (via @tailwindcss/vite) heeft geen aparte config nodig — minder boilerplate dan v3.
`dark:` variant gebruikt standaard `prefers-color-scheme: dark` — geen `.dark`-class of JS-toggle nodig.

## Dark mode: media query i.p.v. class toggle
Automatisch op basis van OS-voorkeur — geen extra UI nodig.
Trade-off: gebruiker kan niet handmatig switchen. Acceptabel voor een calculator-tool.

## LocalStorage i.p.v. cookie
LocalStorage heeft meer opslagruimte (5MB vs. 4KB) en is eenvoudiger te beheren.
Geen server-side cookie parsing nodig. Nadeel: werkt niet cross-device.
`hasStarted` flag in de store bepaalt of landing page of wizard getoond wordt.
`reset()` zet `hasStarted: true` zodat gebruiker na reset in de wizard blijft.

## Feedback: mailto i.p.v. formulier
Geen backend → geen form endpoint. Mailto-link met pre-filled subject/body is de eenvoudigste
aanpak. Trade-off: vereist dat de gebruiker een e-mailclient heeft geconfigureerd.
Adres: feedback@evofnee.nl

## URL-sharing (Fase 2 — backlog)
State serialiseren naar base64 query param (?s=...) voor deelbare berekeningen.
Nog niet geïmplementeerd.
