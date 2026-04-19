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
  const goToStep = useAppStore(s => s.goToStep)

  const StepComponent = STEPS[currentStep]?.component || null

  return (
    <div>
      <ProgressBar current={currentStep} total={STEPS.length} steps={STEPS} onGoTo={goToStep} />

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

function ProgressBar({ current, total, steps, onGoTo }) {
  return (
    <div>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const isCompleted = i < current
          const isCurrent = i === current
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isCompleted && onGoTo(i)}
                  disabled={!isCompleted}
                  title={isCompleted ? `Ga naar: ${step.label}` : undefined}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300 disabled:cursor-default
                    ${isCompleted ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer' : ''}
                    ${isCurrent
                      ? 'bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 ring-4 ring-neutral-900/20 dark:ring-neutral-50/20'
                      : ''}
                    ${i > current ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400' : ''}
                  `}
                >
                  {isCompleted ? '✓' : i + 1}
                </button>
                <span className={`
                  text-xs mt-1 whitespace-nowrap hidden sm:block transition-colors
                  ${isCurrent
                    ? 'text-neutral-900 dark:text-neutral-50 font-medium'
                    : isCompleted
                    ? 'text-green-700 dark:text-green-500 hover:underline cursor-pointer'
                    : 'text-neutral-400 dark:text-neutral-500'}
                `}
                  onClick={() => isCompleted && onGoTo(i)}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-2 mb-4 transition-all duration-300
                  ${i < current ? 'bg-green-600' : 'bg-neutral-200 dark:bg-neutral-700'}
                `} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
