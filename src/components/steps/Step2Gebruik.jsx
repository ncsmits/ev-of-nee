import useAppStore from '../../store/useAppStore'
import StepShell from '../ui/StepShell'
import FieldRow from '../ui/FieldRow'
import ChargingProfileEditor from '../ui/ChargingProfileEditor'

export default function Step2Gebruik({ onNext, onBack }) {
  const annualKm = useAppStore(s => s.annualKm)
  const ownershipYears = useAppStore(s => s.ownershipYears)
  const chargingProfile = useAppStore(s => s.evCosts.chargingProfile)
  const setAnnualKm = useAppStore(s => s.setAnnualKm)
  const setOwnershipYears = useAppStore(s => s.setOwnershipYears)
  const updateChargingProfile = useAppStore(s => s.updateChargingProfile)

  return (
    <StepShell
      title="Jouw rijprofiel"
      subtitle="Hoe gebruik jij de auto? Dit bepaalt een groot deel van de laadkosten."
      onNext={onNext}
      onBack={onBack}
      canNext={annualKm > 0}
    >
      {/* Kilometers & bezitsduur */}
      <div className="space-y-4 mb-8">
        <FieldRow
          label="Jaarlijkse kilometers"
          type="number"
          value={annualKm}
          onChange={v => setAnnualKm(parseInt(v))}
          suffix="km/jaar"
          required
        />
        <FieldRow
          label="Bezitsduur (voor berekening)"
          hint="Over hoeveel jaar wil je de kosten vergelijken?"
          type="number"
          value={ownershipYears}
          onChange={v => setOwnershipYears(parseInt(v))}
          suffix="jaar"
          min={1}
          max={15}
        />
      </div>

      {/* Laadprofiel — TOP EIS */}
      <div>
        <h3 className="font-semibold text-neutral-900 mb-1"
            style={{ fontFamily: 'var(--font-display)' }}>
          Laadprofiel
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          Verdeel hoe jij een EV zou laden. De percentages moeten optellen tot 100%.
        </p>
        <ChargingProfileEditor
          profile={chargingProfile}
          onChange={updateChargingProfile}
        />
      </div>
    </StepShell>
  )
}
