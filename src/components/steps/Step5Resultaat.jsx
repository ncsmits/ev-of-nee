import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'
import useAppStore from '../../store/useAppStore'
import StepShell from '../ui/StepShell'
import {
  calculateIceTco,
  calculateEvTco,
  calculateBreakEven,
  calculateBreakEvenExtended,
  buildChartData,
} from '../../utils/calculations'

export default function Step5Resultaat({ onBack }) {
  const annualKm = useAppStore(s => s.annualKm)
  const ownershipYears = useAppStore(s => s.ownershipYears)
  const iceVehicle = useAppStore(s => s.iceVehicle)
  const iceCosts = useAppStore(s => s.iceCosts)
  const evVehicle = useAppStore(s => s.evVehicle)
  const evCosts = useAppStore(s => s.evCosts)
  const evIsNew = useAppStore(s => s.evIsNew)

  const { iceTco, evTco, breakEven, breakEvenDetails, chartData, switchCost, monthlySaving, avg } = useMemo(() => {
    if (!iceCosts.consumptionLper100km || !evCosts.purchasePrice) return {}

    const ice = calculateIceTco({
      annualKm,
      years: ownershipYears,
      fuelType: iceVehicle.fuelType,
      weightKg: iceVehicle.weightKg,
      consumptionLper100km: iceCosts.consumptionLper100km,
      fuelPricePerLiter: iceCosts.fuelPricePerLiter,
      maintenancePerYear: iceCosts.maintenancePerYear,
      insurancePerYear: iceCosts.insurancePerYear,
    })

    const ev = calculateEvTco({
      annualKm,
      years: ownershipYears,
      purchasePrice: evCosts.purchasePrice,
      evType: evIsNew ? 'ev-new' : 'ev-used',
      weightKg: evVehicle.weightKg || 1800,
      consumptionKwhPer100km: evCosts.consumptionKwhPer100km,
      chargingProfile: evCosts.chargingProfile,
      maintenancePerYear: evCosts.maintenancePerYear,
      insurancePerYear: evCosts.insurancePerYear,
      wallboxCost: evCosts.wallboxCost,
      installationCost: evCosts.installationCost,
      wallboxSubsidy: evCosts.wallboxSubsidy,
      chargingSubscriptionPerMonth: evCosts.chargingSubscriptionPerMonth,
      seppSubsidy: evCosts.seppSubsidy,
      seppApplicable: evCosts.seppApplicable,
    })

    const be = calculateBreakEven(
      ice, ev,
      iceVehicle.estimatedCurrentValue,
      evCosts.purchasePrice,
      ownershipYears
    )

    const chart = buildChartData(
      ice, ev,
      iceVehicle.estimatedCurrentValue,
      evCosts.purchasePrice,
      ownershipYears
    )

    const sc = evCosts.purchasePrice - (iceVehicle.estimatedCurrentValue || 0)
    const annualSaving = ice.totalCost / ownershipYears - ev.totalCost / ownershipYears
    const monthly = Math.round(annualSaving / 12)

    const beDetails = calculateBreakEvenExtended(
      ice, ev,
      iceVehicle.estimatedCurrentValue,
      evCosts.purchasePrice,
      ownershipYears,
    )

    // Average annual costs per category (averages out the EV MRB phase-in)
    const avg = {
      iceMrb:  Math.round(ice.yearly.reduce((s, y) => s + y.mrb, 0) / ownershipYears),
      evMrb:   Math.round(ev.yearly.reduce((s, y) => s + y.mrb, 0) / ownershipYears),
      iceTotal: Math.round(ice.totalCost / ownershipYears),
      // wallboxNet is one-time, exclude from annual average
      evTotal:  Math.round((ev.totalCost - ev.wallboxNet) / ownershipYears),
    }

    return {
      iceTco: ice,
      evTco: ev,
      breakEven: be,
      breakEvenDetails: beDetails,
      chartData: chart,
      switchCost: sc,
      monthlySaving: monthly,
      avg,
    }
  }, [annualKm, ownershipYears, iceVehicle, iceCosts, evVehicle, evCosts, evIsNew])

  if (!iceTco || !evTco) {
    return (
      <StepShell title="Resultaat" onBack={onBack} canNext={false} isLastStep>
        <p className="text-neutral-500 text-center py-16">
          Vul eerst stappen 1–4 volledig in.
        </p>
      </StepShell>
    )
  }

  const evWinsInPeriod = breakEvenDetails?.withinPeriod === true
  const evWinsEventually = breakEvenDetails !== null && !evWinsInPeriod

  function fmtBreakEven(d) {
    if (!d) return null
    if (d.months === 0) return `${d.years} jaar`
    if (d.years === 0) return `${d.months} maanden`
    return `${d.years} jaar en ${d.months} maanden`
  }

  return (
    <StepShell
      title="Jouw resultaat"
      subtitle={`TCO-vergelijking over ${ownershipYears} jaar bij ${annualKm.toLocaleString('nl-NL')} km/jaar`}
      onBack={onBack}
      canNext={false}
      isLastStep
    >
      {/* Verdict */}
      <div className={`rounded-xl p-5 mb-6 border ${
        evWinsInPeriod    ? 'bg-green-50 border-green-200' :
        evWinsEventually  ? 'bg-red-50 border-red-200' :
                            'bg-orange-50 border-orange-200'
      }`}>
        <p className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          {evWinsInPeriod
            ? `⚡ Een EV is voordeliger — break-even na ${fmtBreakEven(breakEvenDetails)}`
            : evWinsEventually
            ? `⚡ Een EV is voordeliger, maar pas na ${fmtBreakEven(breakEvenDetails)}`
            : '⛽ Jouw huidige auto is voordeliger'}
        </p>
        <p className={`text-sm ${evWinsInPeriod ? 'text-neutral-600' : evWinsEventually ? 'text-red-700' : 'text-neutral-600'}`}>
          {evWinsInPeriod
            ? `Je bespaart gemiddeld € ${Math.abs(monthlySaving).toLocaleString('nl-NL')}/maand op lopende kosten.`
            : evWinsEventually
            ? `Break-even valt buiten jouw gekozen periode van ${ownershipYears} jaar.`
            : 'De overstap wordt binnen 25 jaar niet terugverdiend.'}
        </p>
      </div>

      {/* KPI's */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard label="TCO Huidige auto" value={`€ ${Math.round(iceTco.totalCost / 1000)}k`} sub={`${ownershipYears}j totaal`} color="orange" />
        <KpiCard label="TCO EV" value={`€ ${Math.round((evTco.totalCost + switchCost) / 1000)}k`} sub={`incl. aanschaf`} color="green" />
        <KpiCard
          label="Break-even"
          value={breakEvenDetails ? fmtBreakEven(breakEvenDetails) : 'Nooit'}
          sub={evWinsInPeriod ? 'binnen jouw periode' : evWinsEventually ? 'buiten jouw periode' : 'niet bereikt'}
          color={evWinsInPeriod ? 'green' : evWinsEventually ? 'red' : 'neutral'}
        />
        <KpiCard label="Overstapkosten" value={`€ ${Math.round(switchCost / 1000)}k`} sub="EV − verkoopwaarde huidige auto" color="neutral" />
      </div>

      {/* Grafiek */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-neutral-700 mb-1">
          Cumulatieve kosten over tijd
        </h4>
        <p className="text-xs text-neutral-400 mb-3">
          Jaar 0 = initiële investering (aanschaf EV − opbrengst huidige auto + laadpaal). Lopende kosten tellen daarna op.
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey="jaar"
              type="number"
              domain={[0, ownershipYears]}
              ticks={Array.from({ length: ownershipYears + 1 }, (_, i) => i)}
              tickFormatter={v => `Jaar ${v}`}
              tick={{ fontSize: 11, fill: '#71717a' }}
            />
            <YAxis
              tickFormatter={v => `€${Math.round(v / 1000)}k`}
              tick={{ fontSize: 11, fill: '#71717a' }}
              width={52}
            />
            <Tooltip
              formatter={(value) => [`€ ${Math.round(value).toLocaleString('nl-NL')}`, undefined]}
              labelFormatter={v => `Jaar ${v}`}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend />
            {breakEvenDetails && (
              <ReferenceLine
                x={breakEvenDetails.years + breakEvenDetails.months / 12}
                stroke="#16a34a"
                strokeDasharray="4 4"
                label={{ value: 'Break-even', fill: '#16a34a', fontSize: 11 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="huidigeAuto"
              name="Huidige auto"
              stroke="#ea580c"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="EV"
              name="Elektrische auto (EV)"
              stroke="#16a34a"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Jaartabel */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-700 mb-1">Gemiddelde jaarkosten (lopend)</h4>
        <p className="text-xs text-neutral-400 mb-3">
          Gemiddeld over {ownershipYears} jaar. EV-MRB stijgt t/m 2028 door afbouw vrijstelling — dit is het gemiddelde.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 text-neutral-500 font-medium">Kostenpost</th>
                <th className="text-right py-2 text-orange-600 font-medium">Huidige auto / jaar</th>
                <th className="text-right py-2 text-green-700 font-medium">EV / jaar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <TRow label="Brandstof / laden"
                ice={iceTco.yearly[0]?.fuel}
                ev={evTco.yearly[0]?.charging} />
              <TRow label="Onderhoud"
                ice={iceCosts.maintenancePerYear}
                ev={evCosts.maintenancePerYear} />
              <TRow label="Verzekering"
                ice={iceCosts.insurancePerYear}
                ev={evCosts.insurancePerYear} />
              <TRow label="Motorrijtuigenbelasting"
                ice={avg?.iceMrb}
                ev={avg?.evMrb} />
              <TRow label="Laadabonnement"
                ice={0}
                ev={(evCosts.chargingSubscriptionPerMonth || 0) * 12} />
              <tr className="border-t-2 border-neutral-300">
                <td className="py-2 font-semibold text-neutral-900">Gemiddeld per jaar</td>
                <td className="py-2 text-right font-semibold text-orange-600">
                  € {(avg?.iceTotal || 0).toLocaleString('nl-NL')}
                </td>
                <td className="py-2 text-right font-semibold text-green-700">
                  € {(avg?.evTotal || 0).toLocaleString('nl-NL')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </StepShell>
  )
}

function KpiCard({ label, value, sub, color }) {
  const colors = {
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
    neutral: 'bg-neutral-50 border-neutral-200',
  }
  return (
    <div className={`rounded-xl border p-3 ${colors[color] || colors.neutral}`}>
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-neutral-900" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
      <p className="text-xs text-neutral-400">{sub}</p>
    </div>
  )
}

function TRow({ label, ice, ev }) {
  return (
    <tr>
      <td className="py-2 text-neutral-600">{label}</td>
      <td className="py-2 text-right text-neutral-700">€ {Math.round(ice || 0).toLocaleString('nl-NL')}</td>
      <td className="py-2 text-right text-neutral-700">€ {Math.round(ev || 0).toLocaleString('nl-NL')}</td>
    </tr>
  )
}
