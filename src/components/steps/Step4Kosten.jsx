import useAppStore from '../../store/useAppStore'
import StepShell from '../ui/StepShell'
import FieldRow from '../ui/FieldRow'

export default function Step4Kosten({ onNext, onBack }) {
  const evCosts = useAppStore(s => s.evCosts)
  const evVehicle = useAppStore(s => s.evVehicle)
  const updateEvCosts = useAppStore(s => s.updateEvCosts)

  const canContinue = evVehicle.purchasePrice > 0 || evCosts.purchasePrice > 0

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
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
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

        {/* Laadinfrastructuur */}
        <section>
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
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

          {/* Netto laadpaal kosten */}
          {(evCosts.wallboxCost + evCosts.installationCost) > 0 && (
            <div className="mt-3 px-4 py-3 bg-neutral-100 rounded-lg flex justify-between items-center">
              <span className="text-sm text-neutral-600">Netto laadpaalkosten</span>
              <span className="font-semibold text-neutral-900">
                € {Math.max(0, evCosts.wallboxCost + evCosts.installationCost - evCosts.wallboxSubsidy).toLocaleString('nl-NL')}
              </span>
            </div>
          )}
        </section>

        {/* Lopende kosten */}
        <section>
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
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

      </div>
    </StepShell>
  )
}
