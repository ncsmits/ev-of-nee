const KEY = 'ev-of-nee-consent'

export function getConsent() {
  try { return localStorage.getItem(KEY) } catch { return null }
}

export function acceptConsent() {
  try { localStorage.setItem(KEY, 'accepted') } catch {}
  import('./stats.js').then(m => m.initGtag()).catch(() => {})
}

export function declineConsent() {
  try { localStorage.setItem(KEY, 'declined') } catch {}
}

// Re-init for returning users who already gave consent
if (getConsent() === 'accepted') {
  import('./stats.js').then(m => m.initGtag()).catch(() => {})
}
