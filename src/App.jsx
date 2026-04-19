import { useEffect } from 'react'
import useAppStore from './store/useAppStore'
import Header from './components/layout/Header'
import Wizard from './components/wizard/Wizard'
import LandingPage from './components/layout/LandingPage'
import CookieConsent from './components/ui/Notice'

export default function App() {
  const hasStarted = useAppStore(s => s.hasStarted)

  useEffect(() => {
    useAppStore.persist.rehydrate()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {hasStarted ? <Wizard /> : <LandingPage />}
      </main>
      <CookieConsent />
    </div>
  )
}
