import { useState } from 'react'
import useAppStore from '../../store/useAppStore'
import { fetchVehicleInfo, estimateCurrentValue } from '../../api/rdw'
const track = (name, p) => import('../../utils/stats.js').then(m => m.trackEvent(name, p)).catch(() => {})
import StepShell from '../ui/StepShell'
import LicensePlateInput from '../ui/LicensePlateInput'
import FieldRow from '../ui/FieldRow'

const FUEL_TYPES = ['Benzine', 'Diesel', 'LPG', 'Benzine/Elektrisch (PHEV)']

const FUEL_PRICE_DEFAULTS = { benzine: 2.32, diesel: 2.53, lpg: 1.05 }

function defaultFuelPrice(fuelType) {
  const n = (fuelType || '').toLowerCase()
  if (n.includes('diesel')) return FUEL_PRICE_DEFAULTS.diesel
  if (n.includes('lpg'))    return FUEL_PRICE_DEFAULTS.lpg
  return FUEL_PRICE_DEFAULTS.benzine
}

const CAR_BRANDS = [
  'Audi','BMW','Citroën','Dacia','Fiat','Ford','Honda','Hyundai','Kia',
  'Mazda','Mercedes-Benz','Mitsubishi','Nissan','Opel','Peugeot','Renault',
  'Seat','Skoda','Suzuki','Toyota','Volkswagen','Volvo',
]

export default function Step1Voertuig({ onNext, onBack }) {
  const iceLicensePlate = useAppStore(s => s.iceLicensePlate)
  const iceVehicle = useAppStore(s => s.iceVehicle)
  const iceCosts = useAppStore(s => s.iceCosts)
  const setIceLicensePlate = useAppStore(s => s.setIceLicensePlate)
  const setIceVehicleData = useAppStore(s => s.setIceVehicleData)
  const updateIceVehicle = useAppStore(s => s.updateIceVehicle)
  const updateIceCosts = useAppStore(s => s.updateIceCosts)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [manualMode, setManualMode] = useState(false)

  async function handleLookup() {
    if (!iceLicensePlate || iceLicensePlate.length < 4) return
    setLoading(true)
    setError(null)
    try {
      const info = await fetchVehicleInfo(iceLicensePlate)
      setIceVehicleData(info)
      const estimatedValue = estimateCurrentValue(info.catalogPrice, info.year)
      updateIceVehicle({ estimatedCurrentValue: estimatedValue })
      updateIceCosts({ fuelPricePerLiter: defaultFuelPrice(info.fuelType) })
      if (info.consumptionLper100km) {
        updateIceCosts({ consumptionLper100km: info.consumptionLper100km })
      }
      track('vehicle_lookup', { fuel_type: (info.fuelType || 'onbekend').toLowerCase() })
      setManualMode(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function enableManual() {
    track('vehicle_manual')
    setManualMode(true)
    if (!iceVehicle.brand) {
      updateIceVehicle({ brand: ' ', model: '', year: null, fuelType: 'Benzine', weightKg: null })
    }
  }

  const hasVehicle = !!iceVehicle.brand?.trim()
  const isElectric = (iceVehicle.fuelType || '').toLowerCase().includes('elektr')
  const canContinue = hasVehicle && iceCosts.consumptionLper100km && !isElectric

  return (
    <StepShell
      title="Jouw huidige auto"
      subtitle="We beginnen met de gegevens van jouw huidige benzine- of dieselauto."
      onNext={onNext}
      onBack={onBack}
      canNext={canContinue}
      isFirstStep
    >
      {/* Kenteken lookup */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Kenteken opzoeken
        </label>
        <div className="flex gap-3">
          <LicensePlateInput
            value={iceLicensePlate}
            onChange={setIceLicensePlate}
            onEnter={handleLookup}
          />
          <button
            onClick={handleLookup}
            disabled={loading || !iceLicensePlate}
            className="px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900
                       rounded-lg text-sm font-medium
                       hover:bg-neutral-700 dark:hover:bg-neutral-200
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors whitespace-nowrap"
          >
            {loading ? 'Ophalen...' : 'Opzoeken'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {/* Handmatig invullen knop */}
      {!hasVehicle && !loading && (
        <div className="text-center mb-6">
          <span className="text-sm text-neutral-400"> of </span>
          <button
            onClick={enableManual}
            className="text-sm text-neutral-700 dark:text-neutral-300 underline underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-50"
          >
            merk en model handmatig invullen
          </button>
        </div>
      )}

      {/* EV warning */}
      {isElectric && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            ⚠️ Dit voertuig is een elektrische auto. EV of Nee? vergelijkt een brandstofauto met een EV — niet EV met EV. Vul een benzine-, diesel- of LPG-auto in.
          </p>
        </div>
      )}

      {/* Voertuigdata na lookup */}
      {hasVehicle && !manualMode && (
        <div className="bg-neutral-100 dark:bg-neutral-700/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚗</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                {iceVehicle.brand} {iceVehicle.model}
              </span>
              {iceVehicle.year && <span className="text-neutral-500 dark:text-neutral-400 text-sm">({iceVehicle.year})</span>}
            </div>
          </div>
          {!iceVehicle.fuelType && (
            <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-3">
              ⚠️ Brandstoftype niet gevonden — klik opnieuw op "Opzoeken" om MRB correct te berekenen.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span>Brandstof: <strong className="text-neutral-900 dark:text-neutral-50">{iceVehicle.fuelType || '—'}</strong></span>
            <span>Gewicht: <strong className="text-neutral-900 dark:text-neutral-50">{iceVehicle.weightKg ? `${iceVehicle.weightKg} kg` : 'onbekend'}</strong></span>
            {iceVehicle.catalogPrice && (
              <span>Nieuwprijs: <strong className="text-neutral-900 dark:text-neutral-50">€ {iceVehicle.catalogPrice.toLocaleString('nl-NL')}</strong></span>
            )}
            {iceVehicle.estimatedCurrentValue && (
              <span>Geschatte waarde: <strong className="text-neutral-900 dark:text-neutral-50">€ {iceVehicle.estimatedCurrentValue.toLocaleString('nl-NL')}</strong></span>
            )}
          </div>
        </div>
      )}

      {/* Handmatige merk/model invoer */}
      {manualMode && (
        <div className="bg-neutral-100 dark:bg-neutral-700/50 rounded-xl p-4 mb-6 space-y-3">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wide">Voertuig handmatig invullen</p>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Merk</label>
            <input
              type="text"
              list="car-brands"
              value={iceVehicle.brand?.trim() || ''}
              onChange={e => updateIceVehicle({ brand: e.target.value })}
              placeholder="bijv. Volkswagen"
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600
                         bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50
                         focus:border-neutral-900 dark:focus:border-neutral-300 outline-none text-sm"
            />
            <datalist id="car-brands">
              {CAR_BRANDS.map(b => <option key={b} value={b} />)}
            </datalist>
          </div>

          <FieldRow
            label="Model"
            value={iceVehicle.model || ''}
            onChange={v => updateIceVehicle({ model: v })}
            placeholder="bijv. Golf 1.5 TSI"
          />

          <FieldRow
            label="Bouwjaar"
            type="number"
            value={iceVehicle.year || ''}
            onChange={v => updateIceVehicle({ year: parseInt(v) })}
            placeholder="bijv. 2019"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Brandstoftype</label>
            <select
              value={iceVehicle.fuelType || 'Benzine'}
              onChange={e => {
                updateIceVehicle({ fuelType: e.target.value })
                updateIceCosts({ fuelPricePerLiter: defaultFuelPrice(e.target.value) })
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600
                         bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50
                         focus:border-neutral-900 dark:focus:border-neutral-300 outline-none text-sm"
            >
              {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <FieldRow
            label="Gewicht (rijklaar)"
            hint="Staat in je kentekenbewijs deel 1B"
            type="number"
            value={iceVehicle.weightKg || ''}
            onChange={v => updateIceVehicle({ weightKg: parseInt(v) })}
            suffix="kg"
          />
        </div>
      )}

      {hasVehicle && (
        <div className="space-y-4">
          <FieldRow
            label="Brandstofverbruik"
            hint="Liter per 100 km (gecombineerd)"
            type="number"
            value={iceCosts.consumptionLper100km || ''}
            onChange={v => updateIceCosts({ consumptionLper100km: parseFloat(v) })}
            suffix="L/100km"
            required
          />
          <FieldRow
            label="Huidige verkoopwaarde"
            hint="Wat verwacht je te ontvangen bij verkoop?"
            type="number"
            value={iceVehicle.estimatedCurrentValue || ''}
            onChange={v => updateIceVehicle({ estimatedCurrentValue: parseInt(v) })}
            prefix="€"
          />
          <FieldRow
            label="Brandstofprijs"
            hint={`NL-gemiddelde ${
              (iceVehicle.fuelType || '').toLowerCase().includes('diesel') ? 'diesel' :
              (iceVehicle.fuelType || '').toLowerCase().includes('lpg')    ? 'LPG' : 'benzine'
            } apr 2026 — pas aan naar jouw pomp`}
            type="number"
            value={iceCosts.fuelPricePerLiter}
            onChange={v => updateIceCosts({ fuelPricePerLiter: parseFloat(v) })}
            prefix="€"
            suffix="per liter"
            step="0.01"
          />
          <FieldRow
            label="Onderhoud per jaar"
            hint="APK, banden, reparaties, etc."
            type="number"
            value={iceCosts.maintenancePerYear}
            onChange={v => updateIceCosts({ maintenancePerYear: parseInt(v) })}
            prefix="€"
          />
          <FieldRow
            label="Verzekering per jaar"
            type="number"
            value={iceCosts.insurancePerYear}
            onChange={v => updateIceCosts({ insurancePerYear: parseInt(v) })}
            prefix="€"
          />
        </div>
      )}
    </StepShell>
  )
}
