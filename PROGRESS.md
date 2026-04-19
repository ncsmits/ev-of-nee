# Voortgang — EV of Nee?

## Fase 1 — MVP ✅ versie 1.0 (2026-04-19)

### Projectstructuur & setup
- [x] Vite + React project aangemaakt
- [x] Tailwind CSS v4 geconfigureerd
- [x] Zustand geïnstalleerd
- [x] Recharts geïnstalleerd
- [x] GitHub repo aangemaakt
- [x] CLAUDE.md, LESSONS.md, PROGRESS.md, DECISIONS.md aangemaakt
- [x] Mapstructuur src/ ingericht

### Stap 1 — Huidig voertuig (ICE)
- [x] RDW kentekenlookup werkend
- [x] Voertuigdata tonen (merk, model, bouwjaar, brandstof, gewicht)
- [x] Brandstofverbruik ophalen (aparte RDW endpoint)
- [x] Fallback voor ontbrekende RDW-data (handmatig invullen met merk-autocomplete)
- [x] MRB-berekening op basis van gewicht + brandstof
- [x] Actuele brandstofprijs per type (benzine €2,32 / diesel €2,53 / LPG €1,05 — apr 2026)
- [x] Waarschuwing bij leeg brandstoftype (stale localStorage)

### Stap 2 — Gebruiksprofiel
- [x] Jaarkilometers invoer
- [x] Bezitsduur slider (1-15 jaar)
- [x] Laadprofiel configurator (thuis / openbaar / snelladen — optelt tot 100%)
- [x] Prijzen per laadtype instelbaar
- [x] Gewogen gemiddelde laadkosten berekening (€/100km)
- [x] Brandstofkosten berekening ICE (€/100km)

### Stap 3 — EV-keuze
- [x] Keuze nieuw / tweedehands
- [x] Kentekenlookup voor tweedehands EV
- [x] Handmatige invoer voor nieuw (merk/model/prijs)
- [x] Populaire modellen shortlist (Tesla M3, VW ID.3, Polestar 2, etc.)
- [x] Default tab: populaire modellen
- [x] Geen kenteken-tabje bij 'Nieuw'

### Stap 4 — Kosten & financiering
- [x] Aankoopprijs EV
- [x] Laadpaal aanschaf + installatie (optioneel)
- [x] Gemeente laadpaal subsidie (instelbaar)

### Stap 5 — Resultaat
- [x] Verdict box met kleurcodering (groen / rood / oranje)
- [x] Break-even met maandprecisie (interpolatie + extrapolatie tot 25 jaar)
- [x] TCO-tabel met gemiddelde jaarkosten (incl. EV MRB afbouw)
- [x] Break-even grafiek (Recharts) met Jaar 0 voor initiële investering
- [x] Groene stippellijn op exact break-even punt (numerieke X-as)
- [x] Maandlasten vergelijking

## Fase 2 — UX & persistentie ✅ versie 1.1 (2026-04-19)
- [x] LocalStorage persistentie (Zustand persist)
- [x] Wizard terug/volgende navigatie
- [x] Voortgangsbalk
- [x] Dark mode (OS-gebaseerd via prefers-color-scheme)
- [x] Favicon (public/ev.svg — lightning bolt in groen)
- [x] Landing page met uitleg + CTA (hasStarted flow)
- [x] Disclaimer bij resultaat
- [x] Feedback button in header (mailto modal)
- [x] animate-fade-in animatie gedefinieerd in CSS
- [x] Klikbare voltooide stappen in voortgangsbalk (directe navigatie)
- [ ] Mobielvriendelijk getest

## Fase 3 — Berekeningen & lancering ✅ versie 1.2 (2026-04-19)
- [x] Financieringskosten (togglebaar, annuïteitenmethode)
- [x] Alternatief rendement / opportuniteitskosten (togglebaar)
- [x] Waarschuwing bij elektrisch voertuig in stap 1
- [x] SEO: title, meta description, Open Graph, Twitter Card, canonical
- [x] OG-image (1200×630 SVG), robots.txt, sitemap.xml
- [x] www → non-www redirect in .htaccess
- [x] GA4 analytics (code-split, content-blocker-safe)
- [x] GDPR cookiebanner (content-blocker-proof bestandsnamen)
- [x] Privacy-tekst bijgewerkt op landing page
- [ ] Mobielvriendelijkheid getest

## Fase 4 — Backlog
- [ ] Deel-URL (encoded state in query params) — nice to have
- [ ] Live brandstofprijs ophalen (CORS-vriendelijke API zoeken)
- [ ] Marktplaats / AutoTrack deeplinks vanuit EV-selectie
- [ ] EV-suggesties o.b.v. budget & profiel (3 auto's)
- [ ] Affiliate links laadpaal-aanbieders
- [ ] Milieu-impact module (CO₂)
- [ ] Onderhoud inschatten o.b.v. externe databron

---

## Laatste werkende staat
**Branch:** main
**Tag:** v1.2.0
**Datum:** 2026-04-19
**Beschrijving:** v1.2 — financiering, opportuniteitskosten, SEO, GA4 analytics, cookiebanner, EV-waarschuwing
