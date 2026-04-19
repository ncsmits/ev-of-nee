import useAppStore from '../../store/useAppStore'
import FeedbackButton from '../ui/FeedbackButton'

export default function Header() {
  const reset = useAppStore(s => s.reset)
  const hasStarted = useAppStore(s => s.hasStarted)

  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span
            className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            EV of Nee?
          </span>
        </div>
        <div className="flex items-center gap-4">
          <FeedbackButton />
          {hasStarted && (
            <button
              onClick={() => { if (confirm('Opnieuw beginnen? Alle ingevoerde data wordt gewist.')) reset() }}
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
            >
              Opnieuw beginnen
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
