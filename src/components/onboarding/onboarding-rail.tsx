import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type OnboardingStepInfo = {
  key: string
  title: string
  description: string
}

type StepState = 'done' | 'active' | 'upcoming'

export function OnboardingRail({
  headline,
  description,
  steps,
  activeKey,
}: {
  headline: string
  description: string
  steps: OnboardingStepInfo[]
  activeKey: string
}) {
  const activeIndex = steps.findIndex((step) => step.key === activeKey)

  return (
    <div className="hidden w-80 shrink-0 flex-col justify-between bg-primary p-8 text-primary-foreground lg:flex">
      <div />
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-balance">{headline}</h1>
          <p className="text-sm text-primary-foreground/80">{description}</p>
        </div>

        <ol className="flex flex-col">
          {steps.map((step, index) => {
            const state: StepState =
              index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'upcoming'
            const isLast = index === steps.length - 1

            return (
              <li key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                      state === 'done' && 'bg-success text-success-foreground',
                      state === 'active' && 'bg-background text-primary',
                      state === 'upcoming' &&
                        'border border-primary-foreground/30 text-primary-foreground/50',
                    )}
                  >
                    {state === 'done' ? <Check className="size-3.5" /> : index + 1}
                  </span>
                  {!isLast && (
                    <div
                      className={cn(
                        'w-px flex-1',
                        state === 'done' ? 'bg-primary-foreground/40' : 'bg-primary-foreground/15',
                      )}
                    />
                  )}
                </div>
                <div className={cn('flex flex-col gap-0.5 pb-7', isLast && 'pb-0')}>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      state === 'upcoming' && 'text-primary-foreground/50',
                    )}
                  >
                    {step.title}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      state === 'upcoming' ? 'text-primary-foreground/40' : 'text-primary-foreground/70',
                    )}
                  >
                    {step.description}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
      <p className="text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} imperiobeds. All rights reserved.
      </p>
    </div>
  )
}
