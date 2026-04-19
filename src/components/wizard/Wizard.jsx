import useAppStore from '../../store/useAppStore'
import Step1Voertuig from '../steps/Step1Voertuig'
import Step2Gebruik from '../steps/Step2Gebruik'
import Step3EvKeuze from '../steps/Step3EvKeuze'
import Step4Kosten from '../steps/Step4Kosten'
import Step5Resultaat from '../steps/Step5Resultaat'

const STEPS = [
  { label: 'Huidig voertuig', component: Step1Voertuig },
  { label: 'Gebruiksprofiel', component: Step2Gebruik },
  { label: 'EV kiezen',       component: Step3EvKeuze },
  { label: 'Kosten',          component: Step4Kosten },
  { label: 'Resultaat',       component: Step5Resultaat },
]

export default function Wizard() {
  const currentStep = useAppStore(s => s.currentStep)
  const nextStep = useAppStore(s => s.nextStep)
  const prevStep = useAppStore(s => s.prevStep)

  const StepComponent = STEPS[currentStep]?.component || null

  return (
    <div>
      {/* Voortgangsbalk */}
      <ProgressBar current={currentStep} total={STEPS.length} steps={STEPS} />

      {/* Stap content */}
      <div className="mt-8">
        {StepComponent ? (
          <StepComponent onNext={nextStep} onBack={prevStep} />
        ) : (
          <p className="text-neutral-500">Onbekende stap.</p>
        )}
      </div>
    </div>
  )
}

function ProgressBar({ current, total, steps }) {
  return (
    <div>
      {/* Stap-indicator */}
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${i < current ? 'bg-green-600 text-white' : ''}
                  ${i === current ? 'bg-neutral-900 text-white ring-4 ring-neutral-900/20' : ''}
                  ${i > current ? 'bg-neutral-200 text-neutral-500' : ''}
                `}
              >
                {i < current ? '✓' : i + 1}
              </div>
              <span className={`
                text-xs mt-1 whitespace-nowrap hidden sm:block
                ${i === current ? 'text-neutral-900 font-medium' : 'text-neutral-400'}
              `}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`
                flex-1 h-0.5 mx-2 mb-4 transition-all duration-300
                ${i < current ? 'bg-green-600' : 'bg-neutral-200'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
