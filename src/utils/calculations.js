/**
 * Rekenlogica voor TCO-vergelijking ICE vs. EV
 * Alle functies zijn pure functions (geen side effects, geen imports van store)
 *
 * Bronnen:
 * - MRB tarieven 2025: Belastingdienst
 * - SEPP subsidie: RVO.nl
 * - Gemiddelde onderhoudskosten: ANWB
 */

// ============================================================
// MRB — Motorrijtuigenbelasting
// ============================================================

/**
 * Tarief MRB 2025 per kwartaal per 100kg gewicht (afgerond naar boven)
 * Bron: Belastingdienst tarieventabel 2025
 */
const MRB_QUARTERLY_RATES_2025 = {
  benzine: 11.58,    // €/kwartaal per 100kg
  diesel: 18.21,     // €/kwartaal per 100kg (incl. dieseltoeslag)
  lpg: 13.10,
  elektrisch: 0,     // vrijgesteld
}

// Provinciale opcenten 2025 (gemiddelde NL: ~96% — varieert per provincie)
const PROVINCIAL_SURCHARGE = 0.96

/**
 * Berekent jaarlijkse MRB
 * @param {number} weightKg - Voertuiggewicht in kg
 * @param {string} fuelType - brandstoftype (lowercase)
 * @param {number} year - Belastingjaar (voor EV-afbouw regeling)
 * @returns {number} Jaarlijkse MRB in €
 */
export function calculateMrb(weightKg, fuelType, year = 2025) {
  if (!weightKg) return 0

  const normalized = (fuelType || '').toLowerCase()
  let baseRate = 0

  if (normalized.includes('benzin')) baseRate = MRB_QUARTERLY_RATES_2025.benzine
  else if (normalized.includes('diesel')) baseRate = MRB_QUARTERLY_RATES_2025.diesel
  else if (normalized.includes('lpg')) baseRate = MRB_QUARTERLY_RATES_2025.lpg
  else if (normalized.includes('elektr')) {
    // EV-vrijstelling wordt geleidelijk afgebouwd:
    // 2024: 0%, 2025: 25%, 2026: 50%, 2027: 75%, 2028: 100%
    const evPhaseIn = Math.max(0, Math.min(1, (year - 2024) * 0.25))
    baseRate = MRB_QUARTERLY_RATES_2025.benzine * evPhaseIn  // EV betaalt % van benzine-tarief
  }

  const units = Math.ceil(weightKg / 100)  // afgerond naar boven per 100kg
  const quarterlyAmount = units * baseRate * (1 + PROVINCIAL_SURCHARGE)
  return Math.round(quarterlyAmount * 4)  // jaarlijks
}

// ============================================================
// Laadkosten EV
// ============================================================

/**
 * Berekent gewogen gemiddelde laadprijs op basis van laadprofiel
 * @param {ChargingProfile} profile - { home, public, fast } elk met percentage + pricePerKwh
 * @returns {number} Gewogen gemiddelde €/kWh
 */
export function weightedChargingPrice(profile) {
  const types = ['home', 'public', 'fast']
  const total = types.reduce((sum, t) => sum + (profile[t]?.percentage || 0), 0)
  if (total === 0) return 0

  return types.reduce((sum, t) => {
    const pct = (profile[t]?.percentage || 0) / total
    return sum + pct * (profile[t]?.pricePerKwh || 0)
  }, 0)
}

/**
 * Jaarlijkse laadkosten EV
 * @param {number} annualKm
 * @param {number} consumptionKwhPer100km
 * @param {ChargingProfile} chargingProfile
 * @returns {number} €/jaar
 */
export function annualEVChargingCost(annualKm, consumptionKwhPer100km, chargingProfile) {
  const kwhPerYear = (annualKm / 100) * consumptionKwhPer100km
  const pricePerKwh = weightedChargingPrice(chargingProfile)
  return Math.round(kwhPerYear * pricePerKwh)
}

/**
 * Equivalente brandstofkosten per 100km voor vergelijkbaarheid
 * @returns {number} €/100km
 */
export function evCostPer100km(consumptionKwhPer100km, chargingProfile) {
  return consumptionKwhPer100km * weightedChargingPrice(chargingProfile)
}

// ============================================================
// Brandstofkosten ICE
// ============================================================

/**
 * Jaarlijkse brandstofkosten ICE
 */
export function annualFuelCost(annualKm, consumptionLper100km, pricePerLiter) {
  return Math.round((annualKm / 100) * consumptionLper100km * pricePerLiter)
}

// ============================================================
// Afschrijving
// ============================================================

/**
 * Restwaarde na N jaar
 * @param {number} purchasePrice - aankoopprijs
 * @param {number} years - bezitsduur
 * @param {'ice'|'ev-new'|'ev-used'} vehicleType
 */
export function residualValue(purchasePrice, years, vehicleType = 'ice') {
  if (!purchasePrice || years <= 0) return purchasePrice || 0

  // Afschrijvingspercentage per jaar
  const rates = {
    'ice':      [0.80, 0.85, 0.90, 0.90, 0.90, 0.93, 0.93, 0.93, 0.94, 0.94],
    'ev-new':   [0.78, 0.84, 0.90, 0.90, 0.91, 0.92, 0.92, 0.92, 0.93, 0.93],
    'ev-used':  [0.88, 0.90, 0.91, 0.92, 0.92, 0.93, 0.93, 0.94, 0.94, 0.94],
  }

  let value = purchasePrice
  const schedule = rates[vehicleType] || rates['ice']
  for (let i = 0; i < Math.min(years, schedule.length); i++) {
    value *= schedule[i]
  }
  return Math.round(value)
}

/**
 * Jaarlijkse afschrijvingskosten (gemiddeld over bezitsduur)
 */
export function annualDepreciation(purchasePrice, years, vehicleType = 'ice') {
  const residual = residualValue(purchasePrice, years, vehicleType)
  return Math.round((purchasePrice - residual) / years)
}

// ============================================================
// Totale eigendomskosten (TCO)
// ============================================================

/**
 * ICE TCO over N jaar
 */
export function calculateIceTco(params) {
  const {
    annualKm,
    years,
    currentValue,            // verkoopwaarde huidig voertuig (opbrengst)
    fuelType,
    weightKg,
    consumptionLper100km,
    fuelPricePerLiter,
    maintenancePerYear,
    insurancePerYear,
  } = params

  const annualFuel = annualFuelCost(annualKm, consumptionLper100km, fuelPricePerLiter)
  const yearlyResults = []

  let cumulativeCost = 0

  for (let yr = 1; yr <= years; yr++) {
    const mrb = calculateMrb(weightKg, fuelType, 2025 + yr - 1)
    const yearCost = annualFuel + maintenancePerYear + insurancePerYear + mrb
    cumulativeCost += yearCost

    yearlyResults.push({
      year: yr,
      fuel: annualFuel,
      maintenance: maintenancePerYear,
      insurance: insurancePerYear,
      mrb,
      total: yearCost,
      cumulative: cumulativeCost,
    })
  }

  return {
    annualFuelCost: annualFuel,
    totalCost: cumulativeCost,
    // Verkoopwaarde huidig voertuig is een 'opbrengst' — geen kosten
    netCost: cumulativeCost,
    yearly: yearlyResults,
  }
}

/**
 * EV TCO over N jaar
 */
export function calculateEvTco(params) {
  const {
    annualKm,
    years,
    purchasePrice,
    evType,                  // 'ev-new' | 'ev-used'
    weightKg,
    consumptionKwhPer100km,
    chargingProfile,
    maintenancePerYear,
    insurancePerYear,
    wallboxCost,
    installationCost,
    wallboxSubsidy,
    chargingSubscriptionPerMonth,
    seppSubsidy,
    seppApplicable,
  } = params

  // Eenmalige aanloopkosten
  const wallboxNet = Math.max(0, (wallboxCost + installationCost) - wallboxSubsidy)
  const sepp = seppApplicable ? seppSubsidy : 0
  const netPurchasePrice = purchasePrice - sepp

  const annualCharging = annualEVChargingCost(annualKm, consumptionKwhPer100km, chargingProfile)
  const annualSubscription = (chargingSubscriptionPerMonth || 0) * 12

  const yearlyResults = []
  let cumulativeCost = wallboxNet  // Laadpaal is jaar 0

  for (let yr = 1; yr <= years; yr++) {
    const mrb = calculateMrb(weightKg, 'elektrisch', 2025 + yr - 1)
    const yearCost = annualCharging + maintenancePerYear + insurancePerYear + mrb + annualSubscription
    cumulativeCost += yearCost

    yearlyResults.push({
      year: yr,
      charging: annualCharging,
      maintenance: maintenancePerYear,
      insurance: insurancePerYear,
      mrb,
      subscription: annualSubscription,
      total: yearCost,
      cumulative: cumulativeCost,
    })
  }

  const residual = residualValue(purchasePrice, years, evType)

  return {
    annualChargingCost: annualCharging,
    netPurchasePrice,
    wallboxNet,
    residualValue: residual,
    totalCost: cumulativeCost,
    netCost: cumulativeCost,
    yearly: yearlyResults,
  }
}

/**
 * Berekent break-even punt in jaren
 * Vergelijkt cumulatieve jaarkosten ICE vs. EV
 * Inclusief verkoopwaarde huidig voertuig en aankoopprijs EV
 *
 * @returns {number|null} Breakevenpoint in jaren (null als niet bereikt binnen window)
 */
export function calculateBreakEven(iceTco, evTco, iceCurrentValue, evPurchasePrice, years) {
  const switchCost = evPurchasePrice - (iceCurrentValue || 0)

  for (let yr = 1; yr <= years; yr++) {
    const iceCumulative = iceTco.yearly[yr - 1]?.cumulative || 0
    const evCumulative = (evTco.yearly[yr - 1]?.cumulative || 0) + switchCost

    if (evCumulative <= iceCumulative) return yr
  }

  return null
}

/**
 * Break-even met maandprecisie én extrapolatie voorbij de bezitsduur.
 * Geeft {withinPeriod, years, months} of null (nooit break-even).
 */
export function calculateBreakEvenExtended(iceTco, evTco, iceCurrentValue, evPurchasePrice, periodYears, maxYears = 25) {
  const switchCost = evPurchasePrice - (iceCurrentValue || 0)

  let prevIceCum = 0
  let prevEvCum = switchCost + (evTco.wallboxNet || 0)  // jaar-0 staat

  for (let i = 0; i < periodYears; i++) {
    const iceCum = iceTco.yearly[i]?.cumulative ?? 0
    const evCum = (evTco.yearly[i]?.cumulative ?? 0) + switchCost

    if (evCum <= iceCum) {
      // Lineaire interpolatie voor maandprecisie
      const gapBefore = Math.max(0, prevEvCum - prevIceCum)
      const gapAfter  = Math.max(0, iceCum - evCum)
      const fraction  = gapBefore + gapAfter > 0 ? gapBefore / (gapBefore + gapAfter) : 0
      const months    = Math.round(fraction * 12) % 12
      const extraYear = Math.round(fraction * 12) >= 12 ? 1 : 0
      return { withinPeriod: true, years: i + extraYear, months }
    }

    prevIceCum = iceCum
    prevEvCum  = evCum
  }

  // Extrapoleer voorbij bezitsduur met vaste jaarkosten (MRB is gestabiliseerd na 2028)
  const annualIce = iceTco.yearly[periodYears - 1]?.total ?? 0
  const annualEv  = evTco.yearly[periodYears - 1]?.total ?? 0
  const annualSaving = annualIce - annualEv

  if (annualSaving <= 0) return null

  const remainingGap = prevEvCum - prevIceCum
  if (remainingGap <= 0) return null

  const extraYearsFloat = remainingGap / annualSaving
  const totalYearsFloat = periodYears + extraYearsFloat

  if (totalYearsFloat > maxYears) return null

  const wholeYears = Math.floor(totalYearsFloat)
  const months     = Math.round((totalYearsFloat - wholeYears) * 12)
  const yr  = months === 12 ? wholeYears + 1 : wholeYears
  const mo  = months === 12 ? 0 : months

  return { withinPeriod: false, years: yr, months: mo }
}

/**
 * Bouwt data op voor Recharts break-even grafiek
 */
export function buildChartData(iceTco, evTco, iceCurrentValue, evPurchasePrice, years) {
  const switchCost = evPurchasePrice - (iceCurrentValue || 0)

  // Jaar 0: only the upfront investment (EV purchase - ICE resale + wallbox).
  // wallboxNet is already included in evTco.yearly[*].cumulative, so subtract it here
  // to avoid double-counting. evTco.yearly[0].cumulative = wallboxNet + year1Running.
  const data = [{
    jaar: 0,
    huidigeAuto: 0,
    EV: Math.round(switchCost + (evTco.wallboxNet || 0)),
  }]

  for (let i = 0; i < years; i++) {
    data.push({
      jaar: i + 1,
      huidigeAuto: iceTco.yearly[i]?.cumulative || 0,
      EV: (evTco.yearly[i]?.cumulative || 0) + switchCost,
    })
  }

  return data
}
