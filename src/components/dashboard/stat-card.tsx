import type { LucideIcon } from 'lucide-react'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TONE_TEXT_CLASS } from '@/components/dashboard/tone'
import type { StatTrend } from '@/components/dashboard/types'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string
  value: string
  icon: LucideIcon
  trend: StatTrend
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">{value}</CardTitle>
        <CardAction>
          <Icon className="size-4 text-muted-foreground" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className={cn('flex items-center gap-1 text-xs', TONE_TEXT_CLASS[trend.tone])}>
          {trend.icon && <trend.icon className="size-3" />}
          {trend.label}
        </p>
      </CardContent>
    </Card>
  )
}
