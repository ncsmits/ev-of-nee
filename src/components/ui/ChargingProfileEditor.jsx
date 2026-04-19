import { useMemo } from 'react'
import { weightedChargingPrice, evCostPer100km } from '../../utils/calculations'
import useAppStore from '../../store/useAppStore'

const CHARGE_TYPES = [
  {
    key: 'home',
    icon: '🏠',
    label: 'Thuis laden',
    description: 'Eigen laadpaal of stopcontact',
    color: 'bg-green-500',
    colorLight: 'bg-green-100',
    colorText: 'text-green-700',
  },
  {
    key: 'public',
    icon: '🏙️',
    label: 'Openbare paal',
    description: 'Straatpaal, parkeergarage, werk',
    color: 'bg-blue-500',
    colorLight: 'bg-blue-100',
    colorText: 'text-blue-700',
  },
  {
    key: 'fast',
    icon: '⚡',
    label: 'Snelladen (DC)',
    description: 'Fastned, Ionity, Tesla Supercharger',
    color: 'bg-orange-500',
    colorLight: 'bg-orange-100',
    colorText: 'text-orange-700',
  },
]

export default function ChargingProfileEditor({ profile, onChange }) {
  const consumptionKwhPer100km = useAppStore(s => s.evCosts.consumptionKwhPer100km)

  const totalPercentage = useMemo(() =>
    Object.values(profile).reduce((sum, t) => sum + (t.percentage || 0), 0),
    [profile]
  )

  const isValid = totalPercentage === 100
  const avgPrice = useMemo(() => weightedChargingPrice(profile), [profile])
  const costPer100km = useMemo(() =>
    evCostPer100km(consumptionKwhPer100km, profile),
    [consumptionKwhPer100km, profile]
  )

  return (
    <div>
      {/* Visuele verdeling balk */}
      <div className="flex rounded-lg overflow-hidden h-4 mb-5 bg-neutral-200">
        {CHARGE_TYPES.map(ct => (
          <div
            key={ct.key}
            className={`${ct.color} transition-all duration-300`}
            style={{ width: `${profile[ct.key]?.percentage || 0}%` }}
            title={`${ct.label}: ${profile[ct.key]?.percentage || 0}%`}
          />
        ))}
      </div>

      {/* Per laadtype */}
      <div className="space-y-4">
        {CHARGE_TYPES.map(ct => {
          const entry = profile[ct.key] || { percentage: 0, pricePerKwh: 0 }
          return (
            <div key={ct.key} className={`rounded-xl border border-neutral-200 p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{ct.icon}</span>
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">{ct.label}</p>
                    <p className="text-xs text-neutral-500">{ct.description}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${ct.colorLight} ${ct.colorText}`}>
                  {entry.percentage}%
                </span>
              </div>

              {/* Percentage slider */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>Aandeel kilometers</span>
                  <span>{entry.percentage}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={entry.percentage}
                  onChange={e => onChange(ct.key, { percentage: parseInt(e.target.value) })}
                  className="w-full accent-neutral-900"
                />
              </div>

              {/* Prijs per kWh */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-500 whitespace-nowrap">Prijs:</label>
                <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden flex-1">
                  <span className="px-2 py-1.5 bg-neutral-100 text-neutral-500 text-xs border-r border-neutral-300">€</span>
                  <input
                    type="number"
                    min={0}
                    max={2}
                    step={0.01}
                    value={entry.pricePerKwh}
                    onChange={e => onChange(ct.key, { pricePerKwh: parseFloat(e.target.value) })}
                    className="flex-1 px-2 py-1.5 text-sm text-neutral-900 outline-none"
                  />
                  <span className="px-2 py-1.5 bg-neutral-100 text-neutral-500 text-xs border-l border-neutral-300">/kWh</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Validatie + samenvatting */}
      <div className={`mt-4 rounded-xl p-4 ${isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        {!isValid ? (
          <p className="text-sm text-red-700 font-medium">
            ⚠️ Percentages tellen op tot {totalPercentage}% — moet 100% zijn.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-green-600 mb-0.5">Gewogen gem. laadprijs</p>
              <p className="text-lg font-bold text-green-800">
                € {avgPrice.toFixed(2)}<span className="text-sm font-normal">/kWh</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-green-600 mb-0.5">Laadkosten per 100 km</p>
              <p className="text-lg font-bold text-green-800">
                € {costPer100km.toFixed(2)}<span className="text-sm font-normal">/100km</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
