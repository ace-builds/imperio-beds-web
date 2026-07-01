import { isSameMonth, isToday } from 'date-fns'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { dayKey, type CalendarEvent } from '@/lib/calendar-events'
import type { ReservationWithGuestRoom } from '@/lib/schemas/reservation'
import type { StayWithGuestRoom } from '@/lib/schemas/stay'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function EventChip({
  event,
  onSelectReservation,
  onSelectStay,
}: {
  event: CalendarEvent
  onSelectReservation: (reservation: ReservationWithGuestRoom) => void
  onSelectStay: (stay: StayWithGuestRoom) => void
}) {
  if (event.kind === 'arrival') {
    return (
      <button
        type="button"
        onClick={() => onSelectReservation(event.reservation)}
        className="flex w-full items-center gap-1 rounded-md border border-success/30 bg-success/10 px-1.5 py-0.5 text-left text-xs text-success hover:bg-success/20"
      >
        <span className="truncate font-medium">{event.reservation.guest.name}</span>
        <span className="ml-auto shrink-0">Rm {event.reservation.room.number}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelectStay(event.stay)}
      className="flex w-full items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-left text-xs text-warning hover:bg-warning/20"
    >
      <span className="truncate font-medium">{event.stay.guest.name}</span>
      <span className="ml-auto shrink-0">Rm {event.stay.room.number}</span>
    </button>
  )
}

export function ReservationsCalendarGrid({
  days,
  anchorDate,
  eventsByDay,
  onSelectReservation,
  onSelectStay,
  tall = false,
}: {
  days: Date[]
  anchorDate: Date
  eventsByDay: Map<string, CalendarEvent[]>
  onSelectReservation: (reservation: ReservationWithGuestRoom) => void
  onSelectStay: (stay: StayWithGuestRoom) => void
  tall?: boolean
}) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const events = eventsByDay.get(dayKey(day)) ?? []
          const dimmed = !isSameMonth(day, anchorDate)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex flex-col gap-1 border-b border-r p-1.5 last:border-r-0',
                tall ? 'min-h-96' : 'min-h-28',
                dimmed && 'bg-muted/20',
              )}
            >
              <span
                className={cn(
                  'w-fit rounded-full px-1.5 text-xs',
                  isToday(day) && 'bg-primary text-primary-foreground font-medium',
                  dimmed && 'text-muted-foreground',
                )}
              >
                {day.getDate()}
              </span>
              <div className={cn('flex flex-col gap-1 overflow-y-auto', tall ? 'max-h-88' : 'max-h-24')}>
                {events.map((event) => (
                  <EventChip
                    key={`${event.kind}-${event.id}`}
                    event={event}
                    onSelectReservation={onSelectReservation}
                    onSelectStay={onSelectStay}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
