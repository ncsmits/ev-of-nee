import { useEffect } from 'react'
import useAppStore from './store/useAppStore'
import Header from './components/layout/Header'
import Wizard from './components/wizard/Wizard'

export default function App() {
  const currentStep = useAppStore(s => s.currentStep)

  // Wacht op Zustand rehydration vanuit localStorage voordat we renderen
  useEffect(() => {
    useAppStore.persist.rehydrate()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Wizard />
      </main>
    </div>
  )
}
