/**
 * StepShell — wrapper voor elke wizardstap
 * Biedt consistente layout: titel, subtitel, content, en navigatieknoppen
 */
export default function StepShell({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  canNext = true,
  isFirstStep = false,
  isLastStep = false,
  nextLabel,
}) {
  return (
    <div className="animate-fade-in">
      {/* Stap header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-neutral-900 mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-neutral-500 text-sm leading-relaxed">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        {children}
      </div>

      {/* Navigatie */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className="px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900
                     disabled:opacity-0 disabled:pointer-events-none transition-colors"
        >
          ← Terug
        </button>

        {!isLastStep && (
          <button
            onClick={onNext}
            disabled={!canNext}
            className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold
                       hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all duration-200 shadow-sm"
          >
            {nextLabel || 'Volgende →'}
          </button>
        )}
      </div>
    </div>
  )
}
