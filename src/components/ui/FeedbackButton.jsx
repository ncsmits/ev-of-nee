import { useState } from 'react'

const FEEDBACK_EMAIL = 'feedback@evofnee.nl'

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  function handleSend() {
    const subject = encodeURIComponent('Feedback — EV of Nee?')
    const body = encodeURIComponent(message)
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`
    setOpen(false)
    setMessage('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
      >
        Feedback
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-bold text-neutral-900 dark:text-neutral-50"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Feedback geven
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Wat vind je van de tool? Mis je iets, of heb je een suggestie?
            </p>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Jouw feedback..."
              rows={5}
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600
                         bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50
                         text-sm outline-none focus:border-neutral-900 dark:focus:border-neutral-300
                         resize-none transition-colors"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium
                           text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700
                           hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium
                           bg-neutral-900 dark:bg-white text-white dark:text-neutral-900
                           hover:bg-neutral-700 dark:hover:bg-neutral-200
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Versturen via e-mail →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
