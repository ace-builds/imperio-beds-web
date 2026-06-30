import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export function OnboardingHeader({
  icon: Icon,
  stepNumber,
  totalSteps,
  sectionLabel,
  title,
  description,
}: {
  icon?: LucideIcon
  stepNumber: number
  totalSteps: number
  sectionLabel: string
  title: string
  description: string
}) {
  const isLastStep = stepNumber === totalSteps
  const percentComplete = Math.floor(((stepNumber - 1) / totalSteps) * 100)

  return (
    <div className="flex flex-col gap-4">
      <Badge variant="secondary" className="w-fit">
        {Icon && <Icon data-icon="inline-start" />}
        Step {stepNumber} of {totalSteps} — {sectionLabel}
      </Badge>
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Progress value={percentComplete} />
        <span className="text-xs text-muted-foreground">
          {percentComplete}% complete{isLastStep && ' — last step!'}
        </span>
      </div>
    </div>
  )
}
