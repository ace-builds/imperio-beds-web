import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RoomStatusBar } from '@/components/dashboard/room-status-bar'
import type { ArrivalEntry, RoomStatusSegment } from '@/components/dashboard/types'

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function RoomStatusCard({
  segments,
  arrivals,
}: {
  segments: RoomStatusSegment[]
  arrivals: ArrivalEntry[]
}) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Room Status</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm">
            View Calendar
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <RoomStatusBar segments={segments} />

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Arrivals Pending</h3>
          <div className="flex flex-col divide-y">
            {arrivals.map((arrival) => (
              <div key={arrival.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <Avatar>
                  <AvatarFallback>{initials(arrival.guestName)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium">{arrival.guestName}</span>
                  <span className="text-xs text-muted-foreground">
                    {arrival.roomType} • {arrival.nights} {arrival.nights === 1 ? 'Night' : 'Nights'}
                  </span>
                </div>
                <Badge variant={arrival.checkedIn ? 'success' : 'warning'}>
                  {arrival.checkedIn ? 'Checked In' : 'Not Checked In'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
