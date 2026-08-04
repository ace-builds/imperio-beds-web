import { differenceInCalendarDays, format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatMoney } from '@/lib/format'
import type { Currency } from '@/lib/schemas/hotel'
import type { Guest } from '@/lib/schemas/guest'
import type { RoomWithDetails } from '@/lib/schemas/room'

// A room's own price overrides its type's default — same resolution the rooms
// table uses, and what the server snapshots onto the stay at check-in.
export function resolveNightlyRate(room: RoomWithDetails | undefined) {
  if (!room) return null
  return room.pricePerNight ?? room.roomType.pricePerNight
}

export function countNights(checkIn: Date, checkOut: Date) {
  return Math.max(1, differenceInCalendarDays(checkOut, checkIn))
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-sm font-medium">{value}</span>
    </div>
  )
}

const PLACEHOLDER = <span className="font-normal text-muted-foreground">—</span>

// Live running total shown beside the walk-in / reservation forms. The nightly
// rate is what the room resolves to right now, so the figure is an estimate
// until the server snapshots the rate onto the stay at check-in.
export function BookingSummary({
  guest,
  room,
  checkInDate,
  checkOutDate,
  depositAmount,
  currency,
}: {
  guest: Guest | null
  room: RoomWithDetails | undefined
  checkInDate: Date
  checkOutDate: Date
  depositAmount?: number
  currency: Currency | null | undefined
}) {
  const rate = resolveNightlyRate(room)
  const nights = countNights(checkInDate, checkOutDate)
  const total = rate === null ? null : rate * nights
  const deposit = depositAmount && depositAmount > 0 ? depositAmount : 0
  const balance = total === null ? null : Math.max(0, total - deposit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <SummaryRow
          label="Guest"
          value={
            guest ? (
              <span className="flex flex-col items-end">
                <span className="truncate">{guest.name}</span>
                {guest.phone && (
                  <span className="text-xs font-normal text-muted-foreground">{guest.phone}</span>
                )}
              </span>
            ) : (
              PLACEHOLDER
            )
          }
        />
        <SummaryRow
          label="Room"
          value={
            room ? (
              <span className="flex flex-col items-end">
                <span>Room {room.number}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {room.roomType.name}
                </span>
              </span>
            ) : (
              PLACEHOLDER
            )
          }
        />

        <Separator />

        <SummaryRow label="Check-in" value={format(checkInDate, 'EEE, MMM d yyyy')} />
        <SummaryRow label="Check-out" value={format(checkOutDate, 'EEE, MMM d yyyy')} />
        <SummaryRow label="Nights" value={nights} />

        <Separator />

        {rate === null ? (
          <p className="text-sm text-muted-foreground">
            {room
              ? 'No nightly rate is set for this room or its room type, so the total can’t be estimated yet.'
              : 'Pick a room to see the estimated total.'}
          </p>
        ) : (
          <>
            <SummaryRow
              label={`${nights} ${nights === 1 ? 'night' : 'nights'} × ${formatMoney(rate, currency)}`}
              value={formatMoney(total ?? 0, currency)}
            />
            {deposit > 0 && (
              <SummaryRow label="Deposit" value={`− ${formatMoney(deposit, currency)}`} />
            )}
            <Separator />
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-medium">
                {deposit > 0 ? 'Balance on arrival' : 'Estimated total'}
              </span>
              <span className="font-heading text-lg font-semibold">
                {formatMoney(balance ?? 0, currency)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
