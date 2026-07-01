import { format } from 'date-fns'
import type { ReservationWithGuestRoom } from '@/lib/schemas/reservation'
import type { StayWithGuestRoom } from '@/lib/schemas/stay'

export type CalendarEvent =
  | { kind: 'arrival'; id: string; reservation: ReservationWithGuestRoom }
  | { kind: 'departure'; id: string; stay: StayWithGuestRoom }

export function dayKey(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

// Arrivals are pending reservations on their expected check-in day; departures
// are stays on the day they're due out (active stays) or the day they actually
// left (checked-out stays) — so the calendar reads as a log of past departures
// plus a forecast of upcoming ones, not just future bookings.
export function groupEventsByDay(
  reservations: ReservationWithGuestRoom[],
  stays: StayWithGuestRoom[],
): Map<string, CalendarEvent[]> {
  const byDay = new Map<string, CalendarEvent[]>()

  function add(key: string, event: CalendarEvent) {
    const existing = byDay.get(key)
    if (existing) existing.push(event)
    else byDay.set(key, [event])
  }

  for (const reservation of reservations) {
    if (reservation.status !== 'pending') continue
    add(dayKey(new Date(reservation.expectedCheckInAt)), {
      kind: 'arrival',
      id: reservation.id,
      reservation,
    })
  }

  for (const stay of stays) {
    const departureDate = stay.status === 'active' ? stay.expectedCheckOutAt : stay.checkOutAt
    if (!departureDate) continue
    add(dayKey(new Date(departureDate)), { kind: 'departure', id: stay.id, stay })
  }

  return byDay
}
