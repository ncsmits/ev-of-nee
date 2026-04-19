const GA_ID = import.meta.env.VITE_GA_ID || ''

export function initGtag() {
  if (!GA_ID || window.gtag) return
  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { anonymize_ip: true })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
}

export function trackEvent(name, params = {}) {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}

function bucket(value, breakpoints) {
  for (const [limit, label] of breakpoints) {
    if (value < limit) return label
  }
  return breakpoints[breakpoints.length - 1][1]
}

function bucketKm(km) {
  if (!km) return 'onbekend'
  return bucket(km, [
    [5000,     '<5.000'],
    [10000,    '5.000–10.000'],
    [15000,    '10.000–15.000'],
    [20000,    '15.000–20.000'],
    [30000,    '20.000–30.000'],
    [Infinity, '>30.000'],
  ])
}

function bucketPrice(price) {
  if (!price) return 'onbekend'
  return bucket(price, [
    [20000,    '<€20k'],
    [35000,    '€20k–35k'],
    [50000,    '€35k–50k'],
    [70000,    '€50k–70k'],
    [Infinity, '>€70k'],
  ])
}

export function trackResult({ annualKm, evPurchasePrice, fuelType, breakEvenDetails, financingEnabled, oppCostEnabled }) {
  const breakEvenLabel = !breakEvenDetails
    ? 'nooit'
    : breakEvenDetails.years > 10
      ? `>${breakEvenDetails.years}jr`
      : `${breakEvenDetails.years}jr`

  trackEvent('result_viewed', {
    annual_km:  bucketKm(annualKm),
    ev_price:   bucketPrice(evPurchasePrice),
    fuel_type:  (fuelType || 'onbekend').toLowerCase(),
    break_even: breakEvenLabel,
    financing:  financingEnabled ? 'ja' : 'nee',
    opp_cost:   oppCostEnabled   ? 'ja' : 'nee',
  })
}
