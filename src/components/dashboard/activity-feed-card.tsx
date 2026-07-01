import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TONE_ICON_CLASS } from '@/components/dashboard/tone'
import type { ActivityEntry } from '@/components/dashboard/types'
import { cn } from '@/lib/utils'

export function ActivityFeedCard({ activity }: { activity: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 && (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        )}
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {activity.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-md', TONE_ICON_CLASS[entry.tone])}>
                <entry.icon className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{entry.title}</span>
                <span className="text-xs text-muted-foreground">
                  {entry.actor} • {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
