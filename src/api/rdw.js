/**
 * RDW Open Data API
 * Documentatie: https://opendata.rdw.nl
 * Geen authenticatie nodig. CORS is open.
 *
 * Kenteken formaat: GEEN koppeltekens, HOOFDLETTERS
 * Bijv: "GHXXX1" niet "GH-XXX-1"
 */

const RDW_BASE = 'https://opendata.rdw.nl/resource'

/**
 * Normaliseert een kenteken: verwijdert koppeltekens, hoofdletters
 */
export function normalizePlate(plate) {
  return plate.toUpperCase().replace(/-/g, '').trim()
}

/**
 * Haalt basisvoertuigdata op (merk, model, gewicht, brandstof, etc.)
 * Dataset: m9d7-ebf2
 */
export async function fetchVehicleBase(plate) {
  const normalized = normalizePlate(plate)
  const url = `${RDW_BASE}/m9d7-ebf2.json?kenteken=${normalized}`

  const response = await fetch(url)
  if (!response.ok) throw new Error(`RDW API fout: ${response.status}`)

  const data = await response.json()
  if (!data || data.length === 0) {
    throw new Error(`Geen voertuig gevonden voor kenteken ${normalized}`)
  }

  return data[0]
}

/**
 * Haalt brandstofverbruiksdata op
 * Dataset: 8ys7-d773
 * Let op: niet altijd beschikbaar (met name oudere voertuigen)
 */
export async function fetchVehicleFuel(plate) {
  const normalized = normalizePlate(plate)
  const url = `${RDW_BASE}/8ys7-d773.json?kenteken=${normalized}`

  const response = await fetch(url)
  if (!response.ok) throw new Error(`RDW Brandstof API fout: ${response.status}`)

  const data = await response.json()
  if (!data || data.length === 0) return null  // Geen data = null, geen error

  return data[0]
}

/**
 * Hoofdfunctie: haalt alle beschikbare data op voor een kenteken.
 * Combineert basisdata + brandstofdata in één object.
 *
 * @param {string} plate - Kenteken (met of zonder koppeltekens)
 * @returns {VehicleInfo}
 */
export async function fetchVehicleInfo(plate) {
  const [base, fuel] = await Promise.allSettled([
    fetchVehicleBase(plate),
    fetchVehicleFuel(plate),
  ])

  if (base.status === 'rejected') throw base.reason

  const baseData = base.value
  const fuelData = fuel.status === 'fulfilled' ? fuel.value : null

  return parseVehicleInfo(baseData, fuelData)
}

/**
 * Parseert ruwe RDW-data naar een gestructureerd VehicleInfo object
 */
function parseVehicleInfo(base, fuel) {
  const yearStr = base.datum_eerste_toelating || ''
  const year = yearStr.length >= 4 ? parseInt(yearStr.slice(0, 4)) : null

  // Brandstofverbruik: L/100km of kWh/100km afhankelijk van brandstoftype
  let consumptionLper100km = null
  if (fuel?.brandstofverbruik_gecombineerd) {
    const raw = parseFloat(fuel.brandstofverbruik_gecombineerd)
    if (!isNaN(raw) && raw > 0) consumptionLper100km = raw
  }

  // brandstof_omschrijving is absent in the base dataset for EVs; fall back to fuel dataset
  const fuelType = (base.brandstof_omschrijving || fuel?.brandstof_omschrijving || '').toLowerCase()
  const isElectric = fuelType.includes('elektr')

  return {
    // Identificatie
    plate: base.kenteken,
    brand: titleCase(base.merk || ''),
    model: titleCase(base.handelsbenaming || ''),
    year,
    age: year ? new Date().getFullYear() - year : null,

    // Technisch
    fuelType: base.brandstof_omschrijving || fuel?.brandstof_omschrijving || '',
    isElectric,
    weightKg: base.massa_rijklaar ? parseInt(base.massa_rijklaar) : null,
    powerKw: base.vermogen_massarijklaar ? parseInt(base.vermogen_massarijklaar) : null,
    co2GramPerKm: base.co2_uitstoot_gecombineerd ? parseInt(base.co2_uitstoot_gecombineerd) : null,

    // Financieel
    catalogPrice: base.catalogusprijs ? parseInt(base.catalogusprijs) : null,

    // Verbruik
    consumptionLper100km,

    // APK
    apkExpiry: base.vervaldatum_apk || null,

    // Raw data bewaren voor debugging
    _raw: base,
    _rawFuel: fuel,
  }
}

/**
 * Schat de huidige marktwaarde o.b.v. cataloguswaarde en leeftijd.
 * Ruwe benadering — voor nauwkeurige waarde: Marktplaats/AutoTrack.
 *
 * Afschrijvingscurve (ICE):
 * - Jaar 1: -20%, Jaar 2: -15%, Jaar 3-5: -10%/jaar, Jaar 6+: -7%/jaar
 */
export function estimateCurrentValue(catalogPrice, year) {
  if (!catalogPrice || !year) return null

  const age = new Date().getFullYear() - year
  if (age <= 0) return catalogPrice

  let value = catalogPrice
  for (let i = 0; i < age; i++) {
    if (i === 0) value *= 0.80
    else if (i === 1) value *= 0.85
    else if (i < 5) value *= 0.90
    else value *= 0.93
  }

  return Math.round(value)
}

// Helper: eerste letter per woord hoofdletter (voor merk/model display)
function titleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}
