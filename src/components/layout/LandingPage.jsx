import useAppStore from '../../store/useAppStore'

const STEPS_OVERVIEW = [
  { icon: '🚗', title: 'Jouw huidige auto', desc: 'Kenteken opzoeken of handmatig invullen' },
  { icon: '📍', title: 'Rijprofiel', desc: 'Kilometers, laadgedrag en bezitsduur' },
  { icon: '⚡', title: 'EV kiezen & kosten', desc: 'Model, aanschafprijs en laadinfrastructuur' },
]

export default function LandingPage() {
  const startWizard = useAppStore(s => s.startWizard)

  return (
    <div className="animate-fade-in py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-2xl mb-6">
          <span className="text-3xl">⚡</span>
        </div>
        <h1
          className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Is een elektrische auto<br />iets voor jou?
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
          Vergelijk de totale kosten van jouw huidige auto met een EV.
          We berekenen brandstof, laadkosten, MRB, onderhoud en wanneer je break-even draait.
        </p>
      </div>

      {/* Stappen overzicht */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {STEPS_OVERVIEW.map((step, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 text-center shadow-sm"
          >
            <div className="text-2xl mb-3">{step.icon}</div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-50 text-sm mb-1">{step.title}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mb-8">
        <button
          onClick={startWizard}
          className="px-8 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900
                     rounded-xl text-base font-semibold
                     hover:bg-neutral-700 dark:hover:bg-neutral-200
                     transition-all duration-200 shadow-sm"
        >
          Start de vergelijking →
        </button>
      </div>

      {/* Privacy note */}
      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
        🔒 Alle gegevens blijven in jouw browser — er wordt niets opgeslagen op een server.
      </p>
    </div>
  )
}
