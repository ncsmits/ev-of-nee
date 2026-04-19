import { useState } from 'react'
import useAppStore from '../../store/useAppStore'
import { fetchVehicleInfo } from '../../api/rdw'
import StepShell from '../ui/StepShell'
import LicensePlateInput from '../ui/LicensePlateInput'
import FieldRow from '../ui/FieldRow'

const POPULAR_EVS = [
  { brand: 'Tesla', model: 'Model 3 Standard Range', consumptionKwhPer100km: 15.5, rangeKm: 430 },
  { brand: 'Volkswagen', model: 'ID.3 Pure Performance', consumptionKwhPer100km: 15.0, rangeKm: 350 },
  { brand: 'Polestar', model: '2 Standard Range', consumptionKwhPer100km: 17.0, rangeKm: 450 },
  { brand: 'Renault', model: 'Zoe R135', consumptionKwhPer100km: 17.2, rangeKm: 390 },
  { brand: 'Hyundai', model: 'IONIQ 5 Standard Range', consumptionKwhPer100km: 16.8, rangeKm: 385 },
  { brand: 'Kia', model: 'EV6 Standard Range', consumptionKwhPer100km: 16.5, rangeKm: 394 },
  { brand: 'Nissan', model: 'Leaf 40kWh', consumptionKwhPer100km: 18.0, rangeKm: 270 },
  { brand: 'BMW', model: 'i3 120Ah', consumptionKwhPer100km: 16.3, rangeKm: 285 },
]

export default function Step3EvKeuze({ onNext, onBack }) {
  const evIsNew = useAppStore(s => s.evIsNew)
  const evLicensePlate = useAppStore(s => s.evLicensePlate)
  const evVehicle = useAppStore(s => s.evVehicle)
  const evCosts = useAppStore(s => s.evCosts)
  const setEvIsNew = useAppStore(s => s.setEvIsNew)
  const setEvLicensePlate = useAppStore(s => s.setEvLicensePlate)
  const setEvVehicleData = useAppStore(s => s.setEvVehicleData)
  const updateEvVehicle = useAppStore(s => s.updateEvVehicle)
  const updateEvCosts = useAppStore(s => s.updateEvCosts)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [inputMode, setInputMode] = useState('popular')

  async function handleLookup() {
    if (!evLicensePlate) return
    setLoading(true)
    setError(null)
    try {
      const info = await fetchVehicleInfo(evLicensePlate)
      if (!info.isElectric) {
        setError(`Dit voertuig (${info.brand} ${info.model}) is geen EV.`)
        return
      }
      setEvVehicleData(info)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function selectPopular(ev) {
    updateEvVehicle({ brand: ev.brand, model: ev.model, year: null })
    updateEvCosts({ consumptionKwhPer100km: ev.consumptionKwhPer100km })
    setInputMode('manual')
  }

  const hasVehicle = !!evVehicle.brand
  const canContinue = hasVehicle && evCosts.purchasePrice > 0

  return (
    <StepShell
      title="Welke EV?"
      subtitle="Kies de elektrische auto waarmee je wilt vergelijken."
      onNext={onNext}
      onBack={onBack}
      canNext={canContinue}
    >
      <div className="flex gap-2 mb-6">
        {[{ value: false, label: '🔄 Tweedehands' }, { value: true, label: '✨ Nieuw' }].map(opt => (
          <button key={String(opt.value)} onClick={() => {
            setEvIsNew(opt.value)
            if (opt.value && inputMode === 'plate') setInputMode('popular')
          }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
              ${evIsNew === opt.value ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 mb-5">
        {[
          ...(!evIsNew ? [{ key: 'plate', label: 'Kenteken' }] : []),
          { key: 'popular', label: 'Populaire modellen' },
          { key: 'manual', label: 'Handmatig' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setInputMode(tab.key)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all
              ${inputMode === tab.key ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {inputMode === 'plate' && !evIsNew && (
        <div className="mb-5">
          <div className="flex gap-3">
            <LicensePlateInput value={evLicensePlate} onChange={setEvLicensePlate} onEnter={handleLookup} />
            <button onClick={handleLookup} disabled={loading || !evLicensePlate}
              className="px-4 py-2.5 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-700 disabled:opacity-40 transition-colors whitespace-nowrap">
              {loading ? 'Ophalen...' : 'Opzoeken'}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      {inputMode === 'popular' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          {POPULAR_EVS.map(ev => (
            <button key={ev.model} onClick={() => selectPopular(ev)}
              className={`text-left p-3 rounded-xl border transition-all
                ${evVehicle.brand === ev.brand && evVehicle.model === ev.model
                  ? 'border-green-600 bg-green-50' : 'border-neutral-200 hover:border-neutral-400'}`}>
              <p className="text-sm font-medium text-neutral-900">{ev.brand} {ev.model}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{ev.consumptionKwhPer100km} kWh/100km · {ev.rangeKm} km WLTP</p>
            </button>
          ))}
        </div>
      )}

      {hasVehicle && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span className="font-semibold">{evVehicle.brand} {evVehicle.model}</span>
            {evVehicle.year && <span className="text-neutral-500 text-sm">({evVehicle.year})</span>}
          </div>
        </div>
      )}

      {(inputMode === 'manual' || hasVehicle) && (
        <div className="space-y-3">
          {inputMode === 'manual' && !hasVehicle && (
            <>
              <FieldRow label="Merk" value={evVehicle.brand} onChange={v => updateEvVehicle({ brand: v })} placeholder="bijv. Tesla" />
              <FieldRow label="Model" value={evVehicle.model} onChange={v => updateEvVehicle({ model: v })} placeholder="bijv. Model 3" />
            </>
          )}
          <FieldRow label="Aankoopprijs" type="number" value={evCosts.purchasePrice || ''} onChange={v => updateEvCosts({ purchasePrice: parseInt(v) })} prefix="€" required />
          <FieldRow label="Verbruik" type="number" value={evCosts.consumptionKwhPer100km} onChange={v => updateEvCosts({ consumptionKwhPer100km: parseFloat(v) })} suffix="kWh/100km" step="0.1" />
        </div>
      )}
    </StepShell>
  )
}
