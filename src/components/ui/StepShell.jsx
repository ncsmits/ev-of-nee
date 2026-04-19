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
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">{subtitle}</p>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
        {children}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400
                     hover:text-neutral-900 dark:hover:text-neutral-50
                     disabled:opacity-0 disabled:pointer-events-none transition-colors"
        >
          ← Terug
        </button>

        {!isLastStep && (
          <button
            onClick={onNext}
            disabled={!canNext}
            className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900
                       rounded-xl text-sm font-semibold
                       hover:bg-neutral-700 dark:hover:bg-neutral-200
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all duration-200 shadow-sm"
          >
            {nextLabel || 'Volgende →'}
          </button>
        )}
      </div>
    </div>
  )
}
