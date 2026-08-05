import { CheckCircle2 } from '#/shared/ui/icons'
import { clsx } from 'clsx'
import { jobFormSteps } from '../jobFormConfig'

export default function JobStepper({
  currentStep,
  onStepChange,
}: {
  currentStep: number
  onStepChange: (step: number) => void
}) {
  return (
    <div className="overflow-x-auto border-b border-slate-200 px-6 py-7">
      <div className="grid min-w-[720px] grid-cols-6 items-start">
        {jobFormSteps.map((item, index) => {
          const isActive = index === currentStep
          const isDone = index < currentStep

          return (
            <button
              key={item}
              type="button"
              onClick={() => onStepChange(index)}
              className="group relative min-w-0 px-2 text-center"
            >
              {index > 0 && (
                <span className="absolute left-0 top-4 h-px w-1/2 bg-slate-200" />
              )}
              {index < jobFormSteps.length - 1 && (
                <span className="absolute right-0 top-4 h-px w-1/2 bg-slate-200" />
              )}
              <span
                className={clsx(
                  'relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : isDone
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-300 text-white',
                )}
              >
                {isDone ? <CheckCircle2 size={16} /> : index + 1}
              </span>
              <span
                className={clsx(
                  'mt-4 block truncate text-sm font-medium',
                  isActive ? 'text-slate-900' : 'text-slate-500',
                )}
              >
                {item}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
