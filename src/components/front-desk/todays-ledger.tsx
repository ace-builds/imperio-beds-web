import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCheckOut, useStays } from '@/hooks/use-stays'
import { useReservationCheckIn, useReservations } from '@/hooks/use-reservations'
import type { StayWithGuestRoom } from '@/lib/schemas/stay'
import type { ReservationPaymentStatus } from '@/lib/schemas/reservation'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function isToday(date: Date) {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function isTodayOrPast(date: Date) {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  return date <= now
}

const PAYMENT_BADGE: Record<ReservationPaymentStatus, 'success' | 'warning' | 'destructive'> = {
  paid: 'success',
  deposit: 'warning',
  unpaid: 'destructive',
}

function ArrivalsList({ hotelId }: { hotelId: string }) {
  const { data: reservations, isLoading } = useReservations(hotelId, 'pending')
  const checkIn = useReservationCheckIn(hotelId)

  const dueArrivals = (reservations ?? []).filter((reservation) =>
    isTodayOrPast(new Date(reservation.expectedCheckInAt)),
  )

  if (isLoading) return <p className="px-4 py-3 text-sm text-muted-foreground">Loading…</p>
  if (dueArrivals.length === 0) {
    return <p className="px-4 py-3 text-sm text-muted-foreground">No arrivals due.</p>
  }

  return (
    <div className="flex flex-col gap-1">
      {dueArrivals.map((reservation) => (
        <div key={reservation.id} className="flex items-center gap-3 px-4 py-2">
          <Avatar size="sm">
            <AvatarFallback>{initials(reservation.guest.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{reservation.guest.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Room {reservation.room.number}</span>
              <span>•</span>
              <Badge variant={PAYMENT_BADGE[reservation.paymentStatus]} className="h-4">
                {reservation.paymentStatus}
              </Badge>
            </div>
          </div>
          <Button
            size="sm"
            disabled={checkIn.isPending}
            onClick={() => checkIn.mutate(reservation.id)}
          >
            Check In
          </Button>
        </div>
      ))}
      {checkIn.isError && (
        <p className="px-4 text-sm text-destructive">{checkIn.error.message}</p>
      )}
    </div>
  )
}

function DeparturesList({
  hotelId,
  onViewStay,
}: {
  hotelId: string
  onViewStay: (stay: StayWithGuestRoom) => void
}) {
  const { data: stays, isLoading } = useStays(hotelId, 'active')
  const checkOut = useCheckOut(hotelId)

  const departures = (stays ?? []).filter((stay) => isToday(new Date(stay.expectedCheckOutAt)))

  if (isLoading) return <p className="px-4 py-3 text-sm text-muted-foreground">Loading…</p>
  if (departures.length === 0) {
    return <p className="px-4 py-3 text-sm text-muted-foreground">No departures today.</p>
  }

  return (
    <div className="flex flex-col gap-1">
      {departures.map((stay) => (
        <div key={stay.id} className="flex flex-col gap-1 px-4 py-2">
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback>{initials(stay.guest.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{stay.guest.name}</p>
              <p className="text-xs text-muted-foreground">Room {stay.room.number}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onViewStay(stay)}>
              View
            </Button>
            <Button
              size="sm"
              disabled={checkOut.isPending}
              onClick={() => checkOut.mutate(stay.id)}
            >
              Check Out
            </Button>
          </div>
          {checkOut.isError && checkOut.variables === stay.id && (
            <p className="pl-11 text-xs text-destructive">{checkOut.error.message}</p>
          )}
        </div>
      ))}
    </div>
  )
}

function InHouseList({
  hotelId,
  onViewStay,
}: {
  hotelId: string
  onViewStay: (stay: StayWithGuestRoom) => void
}) {
  const { data: stays, isLoading } = useStays(hotelId, 'active')

  if (isLoading) return <p className="px-4 py-3 text-sm text-muted-foreground">Loading…</p>
  if (!stays || stays.length === 0) {
    return <p className="px-4 py-3 text-sm text-muted-foreground">No guests in house.</p>
  }

  return (
    <div className="flex flex-col gap-1">
      {stays.map((stay) => (
        <div key={stay.id} className="flex items-center gap-3 px-4 py-2">
          <Avatar size="sm">
            <AvatarFallback>{initials(stay.guest.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{stay.guest.name}</p>
            <p className="text-xs text-muted-foreground">
              Room {stay.room.number} • Out {new Date(stay.expectedCheckOutAt).toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onViewStay(stay)}>
            View
          </Button>
        </div>
      ))}
    </div>
  )
}

export function TodaysLedger({
  hotelId,
  onViewStay,
  onNewWalkIn,
  onNewReservation,
}: {
  hotelId: string
  onViewStay: (stay: StayWithGuestRoom) => void
  onNewWalkIn: () => void
  onNewReservation: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0">
        <CardHeader>
          <CardTitle>Today's Ledger</CardTitle>
        </CardHeader>
        <Tabs defaultValue="arrivals">
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="arrivals">Arrivals</TabsTrigger>
              <TabsTrigger value="departures">Departures</TabsTrigger>
              <TabsTrigger value="in-house">In House</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="arrivals">
            <ArrivalsList hotelId={hotelId} />
            <div className="px-4 pb-3">
              <Button variant="outline" size="sm" className="w-full" onClick={onNewReservation}>
                + New Reservation
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="departures">
            <DeparturesList hotelId={hotelId} onViewStay={onViewStay} />
          </TabsContent>
          <TabsContent value="in-house">
            <InHouseList hotelId={hotelId} onViewStay={onViewStay} />
          </TabsContent>
        </Tabs>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button variant="outline" className="justify-start" onClick={onNewWalkIn}>
            New Walk-in
          </Button>
          <Button variant="outline" className="justify-start" onClick={onNewReservation}>
            New Reservation
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
