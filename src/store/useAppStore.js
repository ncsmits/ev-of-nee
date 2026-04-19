import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Default charging profile (percentages must add up to 100)
const defaultChargingProfile = {
  home: { percentage: 70, pricePerKwh: 0.23 },      // Thuis laden
  public: { percentage: 20, pricePerKwh: 0.42 },     // Openbare paal
  fast: { percentage: 10, pricePerKwh: 0.69 },       // Snelladen (DC)
}

// Default ICE vehicle costs
const defaultIceCosts = {
  fuelPricePerLiter: 2.32,         // €/liter benzine (NL gemiddelde april 2026)
  consumptionLper100km: null,      // uit RDW, anders handmatig
  maintenancePerYear: 1200,        // €/jaar onderhoud
  insurancePerYear: 900,           // €/jaar verzekering
  annualKm: 15000,
}

// Default financing settings
const defaultEvFinancing = {
  enabled: false,
  termYears: 5,
  interestRatePercent: 5.9,   // typisch NL autolening 2025
}

// Default opportunity cost settings
const defaultOpportunityCost = {
  enabled: false,
  annualReturnPercent: 6,     // historisch gemiddeld aandelenrendement
}

// Default EV costs
const defaultEvCosts = {
  purchasePrice: 0,
  maintenancePerYear: 500,         // EV heeft minder onderhoud
  insurancePerYear: 950,
  chargingProfile: defaultChargingProfile,
  consumptionKwhPer100km: 17,      // kWh/100km (default middenklasse)
  wallboxCost: 800,                // aanschaf laadpaal
  installationCost: 500,          // installatiekosten
  wallboxSubsidy: 0,               // gemeentelijke subsidie
  chargingSubscriptionPerMonth: 0, // abonnement openbare laadpassen
  seppSubsidy: 2950,               // SEPP subsidie (2025 bedrag)
  seppApplicable: false,           // user moet controleren of van toepassing
}

const useAppStore = create(
  persist(
    (set, get) => ({
      // === WIZARD STATE ===
      hasStarted: false,
      currentStep: 0,
      totalSteps: 5,

      // === HUIDIG VOERTUIG (ICE) ===
      iceLicensePlate: '',
      iceVehicleData: null,       // raw RDW response
      iceVehicle: {
        brand: '',
        model: '',
        year: null,
        fuelType: '',
        weightKg: null,
        catalogPrice: null,
        estimatedCurrentValue: null,
      },
      iceCosts: { ...defaultIceCosts },

      // === EV KEUZE ===
      evIsNew: false,             // true = nieuw, false = tweedehands
      evLicensePlate: '',
      evVehicleData: null,        // raw RDW response (tweedehands)
      evVehicle: {
        brand: '',
        model: '',
        year: null,
        batteryKwh: null,
        rangeKm: null,
        purchasePrice: null,
      },
      evCosts: { ...defaultEvCosts },

      // === FINANCIERING & VERMOGENSKOSTEN ===
      evFinancing: { ...defaultEvFinancing },
      opportunityCost: { ...defaultOpportunityCost },

      // === GEBRUIKSPROFIEL ===
      annualKm: 15000,
      ownershipYears: 5,          // bezitsduur voor TCO-berekening

      // === ACTIONS: Wizard navigatie ===
      startWizard: () => set({ hasStarted: true, currentStep: 0 }),
      nextStep: () => set(state => ({
        currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1)
      })),
      prevStep: () => set(state => ({
        currentStep: Math.max(state.currentStep - 1, 0)
      })),
      goToStep: (step) => set({ currentStep: step }),

      // === ACTIONS: ICE voertuig ===
      setIceLicensePlate: (plate) => set({ iceLicensePlate: plate.toUpperCase().replace(/-/g, '') }),
      setIceVehicleData: (vehicleInfo) => set({
        iceVehicleData: vehicleInfo,
        iceVehicle: {
          brand: vehicleInfo.brand || '',
          model: vehicleInfo.model || '',
          year: vehicleInfo.year || null,
          fuelType: vehicleInfo.fuelType || '',
          weightKg: vehicleInfo.weightKg || null,
          catalogPrice: vehicleInfo.catalogPrice || null,
          estimatedCurrentValue: null,
        },
      }),
      updateIceVehicle: (fields) => set(state => ({
        iceVehicle: { ...state.iceVehicle, ...fields }
      })),
      updateIceCosts: (fields) => set(state => ({
        iceCosts: { ...state.iceCosts, ...fields }
      })),

      // === ACTIONS: EV ===
      setEvLicensePlate: (plate) => set({ evLicensePlate: plate.toUpperCase().replace(/-/g, '') }),
      setEvVehicleData: (vehicleInfo) => set({
        evVehicleData: vehicleInfo,
        evVehicle: {
          brand: vehicleInfo.brand || '',
          model: vehicleInfo.model || '',
          year: vehicleInfo.year || null,
          weightKg: vehicleInfo.weightKg || null,
          batteryKwh: null,
          rangeKm: null,
          purchasePrice: null,
        },
      }),
      updateEvVehicle: (fields) => set(state => ({
        evVehicle: { ...state.evVehicle, ...fields }
      })),
      updateEvCosts: (fields) => set(state => ({
        evCosts: { ...state.evCosts, ...fields }
      })),
      setEvIsNew: (isNew) => set({ evIsNew: isNew }),

      // === ACTIONS: Laadprofiel ===
      // Percentages worden genormaliseerd zodat ze altijd optellen tot 100
      updateChargingProfile: (type, fields) => set(state => {
        let profile = { ...state.evCosts.chargingProfile }
        profile[type] = { ...profile[type], ...fields }

        // Als percentage veranderd: herbalanceer de andere twee
        if ('percentage' in fields) {
          profile = rebalanceProfile(profile, type)
        }

        return { evCosts: { ...state.evCosts, chargingProfile: profile } }
      }),

      // === ACTIONS: Financiering & vermogenskosten ===
      updateEvFinancing: (fields) => set(state => ({
        evFinancing: { ...state.evFinancing, ...fields }
      })),
      updateOpportunityCost: (fields) => set(state => ({
        opportunityCost: { ...state.opportunityCost, ...fields }
      })),

      // === ACTIONS: Gebruiksprofiel ===
      setAnnualKm: (km) => set({ annualKm: km }),
      setOwnershipYears: (years) => set({ ownershipYears: years }),

      // === RESET ===
      reset: () => set({
        hasStarted: true,
        currentStep: 0,
        iceLicensePlate: '',
        iceVehicleData: null,
        iceVehicle: { brand: '', model: '', year: null, fuelType: '', weightKg: null, catalogPrice: null, estimatedCurrentValue: null },
        iceCosts: { ...defaultIceCosts },
        evIsNew: false,
        evLicensePlate: '',
        evVehicleData: null,
        evVehicle: { brand: '', model: '', year: null, batteryKwh: null, rangeKm: null, purchasePrice: null },
        evCosts: { ...defaultEvCosts },
        annualKm: 15000,
        ownershipYears: 5,
        evFinancing: { ...defaultEvFinancing },
        opportunityCost: { ...defaultOpportunityCost },
      }),
    }),
    {
      name: 'ev-of-nee-v1',  // LocalStorage key
      // Sla alles op behalve de actions (die zijn niet serialiseerbaar nodig)
      partialize: (state) => ({
        hasStarted: state.hasStarted,
        currentStep: state.currentStep,
        iceLicensePlate: state.iceLicensePlate,
        iceVehicleData: state.iceVehicleData,
        iceVehicle: state.iceVehicle,
        iceCosts: state.iceCosts,
        evIsNew: state.evIsNew,
        evLicensePlate: state.evLicensePlate,
        evVehicleData: state.evVehicleData,
        evVehicle: state.evVehicle,
        evCosts: state.evCosts,
        annualKm: state.annualKm,
        ownershipYears: state.ownershipYears,
        evFinancing: state.evFinancing,
        opportunityCost: state.opportunityCost,
      }),
    }
  )
)

// === HELPERS ===

/**
 * Herbalanceer laadprofiel zodat percentages optellen tot 100.
 * Het gewijzigde type is leidend; de overige twee worden proportioneel aangepast.
 */
function rebalanceProfile(profile, changedType) {
  const types = ['home', 'public', 'fast']
  const others = types.filter(t => t !== changedType)
  const remaining = 100 - profile[changedType].percentage

  const currentOtherTotal = others.reduce((sum, t) => sum + profile[t].percentage, 0)

  if (currentOtherTotal === 0) {
    // Verdeel gelijk over de andere twee
    others.forEach(t => { profile[t] = { ...profile[t], percentage: remaining / 2 } })
  } else {
    others.forEach(t => {
      profile[t] = {
        ...profile[t],
        percentage: Math.round((profile[t].percentage / currentOtherTotal) * remaining)
      }
    })
    // Correctie voor afrondingsfouten
    const total = types.reduce((s, t) => s + profile[t].percentage, 0)
    if (total !== 100) {
      profile[others[0]].percentage += (100 - total)
    }
  }

  return profile
}

export default useAppStore
