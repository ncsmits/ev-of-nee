import { useState } from 'react'
import { getConsent, acceptConsent, declineConsent } from '../../utils/prefs'

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => getConsent() === null)

  if (!visible) return null

  function accept() {
    acceptConsent()
    setVisible(false)
  }

  function decline() {
    declineConsent()
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 animate-fade-in">
      <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 flex-1 leading-relaxed">
          <span className="font-semibold text-neutral-900 dark:text-neutral-50">Analytische cookies </span>
          We meten anoniem hoe de tool wordt gebruikt om hem te verbeteren.
          Geen advertenties, geen profiling, geen persoonlijke gegevens.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400
                       border border-neutral-300 dark:border-neutral-600 rounded-lg
                       hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            Weigeren
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium
                       bg-neutral-900 dark:bg-white text-white dark:text-neutral-900
                       rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
          >
            Accepteren
          </button>
        </div>
      </div>
    </div>
  )
}
