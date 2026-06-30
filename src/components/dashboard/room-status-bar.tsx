import { TONE_DOT_CLASS } from '@/components/dashboard/tone'
import type { RoomStatusSegment } from '@/components/dashboard/types'
import { cn } from '@/lib/utils'

export function RoomStatusBar({ segments }: { segments: RoomStatusSegment[] }) {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={cn(TONE_DOT_CLASS[segment.tone])}
            style={{ width: total > 0 ? `${(segment.count / total) * 100}%` : 0 }}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', TONE_DOT_CLASS[segment.tone])} />
            <span className="text-muted-foreground">
              {segment.label} ({segment.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
