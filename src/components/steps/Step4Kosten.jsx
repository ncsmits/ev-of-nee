import useAppStore from '../../store/useAppStore'
import StepShell from '../ui/StepShell'
import FieldRow from '../ui/FieldRow'
import { calculateFinancingInterest } from '../../utils/calculations'

export default function Step4Kosten({ onNext, onBack }) {
  const evCosts = useAppStore(s => s.evCosts)
  const evVehicle = useAppStore(s => s.evVehicle)
  const evFinancing = useAppStore(s => s.evFinancing)
  const opportunityCost = useAppStore(s => s.opportunityCost)
  const updateEvCosts = useAppStore(s => s.updateEvCosts)
  const updateEvFinancing = useAppStore(s => s.updateEvFinancing)
  const updateOpportunityCost = useAppStore(s => s.updateOpportunityCost)

  const canContinue = evVehicle.purchasePrice > 0 || evCosts.purchasePrice > 0

  const loanAmount = evCosts.purchasePrice || 0
  const financingInterest = evFinancing.enabled
    ? calculateFinancingInterest(loanAmount, evFinancing.termYears, evFinancing.interestRatePercent)
    : 0

  return (
    <StepShell
      title="Kosten & investering"
      subtitle="Wat zijn de kosten rondom aanschaf en gebruik van de EV?"
      onNext={onNext}
      onBack={onBack}
      canNext={canContinue}
    >
      <div className="space-y-6">

        {/* Aanschaf */}
        <section>
          <h4 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            Aanschaf
          </h4>
          <div className="space-y-3">
            <FieldRow
              label="Aankoopprijs EV"
              type="number"
              value={evCosts.purchasePrice || ''}
              onChange={v => updateEvCosts({ purchasePrice: parseInt(v) })}
              prefix="€"
              required
            />
          </div>
        </section>

        {/* Financiering */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Financiering
            </h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Ik financier de aanschaf</span>
              <button
                role="switch"
                aria-checked={evFinancing.enabled}
                onClick={() => updateEvFinancing({ enabled: !evFinancing.enabled })}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  evFinancing.enabled ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                  evFinancing.enabled
                    ? 'left-5 bg-white dark:bg-neutral-900'
                    : 'left-1 bg-white dark:bg-neutral-400'
                }`} />
              </button>
            </label>
          </div>

          {evFinancing.enabled && (
            <div className="space-y-3">
              <FieldRow
                label="Looptijd"
                type="number"
                value={evFinancing.termYears}
                onChange={v => updateEvFinancing({ termYears: parseInt(v) })}
                suffix="jaar"
                min={1}
                max={10}
              />
              <FieldRow
                label="Jaarlijkse rente"
                type="number"
                value={evFinancing.interestRatePercent}
                onChange={v => updateEvFinancing({ interestRatePercent: parseFloat(v) })}
                suffix="%"
                step="0.1"
                hint="Typisch NL autolening: 5–8%"
              />
              {financingInterest > 0 && (
                <div className="px-4 py-3 bg-neutral-100 dark:bg-neutral-700/50 rounded-lg flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Totale rentekosten</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                    € {financingInterest.toLocaleString('nl-NL')}
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Laadinfrastructuur */}
        <section>
          <h4 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            Laadinfrastructuur thuis
          </h4>
          <div className="space-y-3">
            <FieldRow
              label="Aanschaf laadpaal"
              hint="Bijv. Alfen, Easee: € 500–€ 1.500"
              type="number"
              value={evCosts.wallboxCost}
              onChange={v => updateEvCosts({ wallboxCost: parseInt(v) })}
              prefix="€"
            />
            <FieldRow
              label="Installatiekosten"
              hint="Elektricien + eventuele groepenkast aanpassing"
              type="number"
              value={evCosts.installationCost}
              onChange={v => updateEvCosts({ installationCost: parseInt(v) })}
              prefix="€"
            />
            <FieldRow
              label="Gemeentelijke laadpaalsubsidie"
              hint="Verschilt per gemeente — check jouw gemeente"
              type="number"
              value={evCosts.wallboxSubsidy}
              onChange={v => updateEvCosts({ wallboxSubsidy: parseInt(v) })}
              prefix="€"
            />
          </div>

          {(evCosts.wallboxCost + evCosts.installationCost) > 0 && (
            <div className="mt-3 px-4 py-3 bg-neutral-100 dark:bg-neutral-700/50 rounded-lg flex justify-between items-center">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Netto laadpaalkosten</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                € {Math.max(0, evCosts.wallboxCost + evCosts.installationCost - evCosts.wallboxSubsidy).toLocaleString('nl-NL')}
              </span>
            </div>
          )}
        </section>

        {/* Jaarlijkse kosten */}
        <section>
          <h4 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            Jaarlijkse kosten
          </h4>
          <div className="space-y-3">
            <FieldRow
              label="Laadabonnement openbaar"
              hint="Bijv. Plugsurfing, NewMotion: € 5–€ 15/maand"
              type="number"
              value={evCosts.chargingSubscriptionPerMonth}
              onChange={v => updateEvCosts({ chargingSubscriptionPerMonth: parseFloat(v) })}
              prefix="€"
              suffix="per maand"
            />
            <FieldRow
              label="Onderhoud per jaar"
              hint="EV heeft minder onderhoud — geen olie, minder remmen"
              type="number"
              value={evCosts.maintenancePerYear}
              onChange={v => updateEvCosts({ maintenancePerYear: parseInt(v) })}
              prefix="€"
            />
            <FieldRow
              label="Verzekering per jaar"
              type="number"
              value={evCosts.insurancePerYear}
              onChange={v => updateEvCosts({ insurancePerYear: parseInt(v) })}
              prefix="€"
            />
            <FieldRow
              label="Verbruik (kWh/100km)"
              hint="WLTP — in de praktijk 10-20% hoger"
              type="number"
              value={evCosts.consumptionKwhPer100km}
              onChange={v => updateEvCosts({ consumptionKwhPer100km: parseFloat(v) })}
              suffix="kWh/100km"
              step="0.1"
            />
          </div>
        </section>

        {/* Alternatief rendement */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Alternatief rendement
              </h4>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Meenemen</span>
              <button
                role="switch"
                aria-checked={opportunityCost.enabled}
                onClick={() => updateOpportunityCost({ enabled: !opportunityCost.enabled })}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  opportunityCost.enabled ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                  opportunityCost.enabled
                    ? 'left-5 bg-white dark:bg-neutral-900'
                    : 'left-1 bg-white dark:bg-neutral-400'
                }`} />
              </button>
            </label>
          </div>

          {opportunityCost.enabled ? (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Het geld dat je in de EV steekt, kun je niet beleggen. Dit rekent wat dat alternatief jou zou hebben opgebracht.
              </p>
              <FieldRow
                label="Verwacht jaarlijks rendement"
                type="number"
                value={opportunityCost.annualReturnPercent}
                onChange={v => updateOpportunityCost({ annualReturnPercent: parseFloat(v) })}
                suffix="%"
                step="0.5"
                hint="MSCI World historisch gemiddelde: ca. 7–9% nominaal per jaar"
              />
            </div>
          ) : (
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Als je de aanschaf niet financiert maar het geld ook had kunnen beleggen, kun je dit optioneel meenemen in de vergelijking.
            </p>
          )}
        </section>

      </div>
    </StepShell>
  )
}
