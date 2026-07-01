import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useActiveHotel } from '@/hooks/use-hotels'
import { useCancelReservation, useReservationCheckIn } from '@/hooks/use-reservations'
import { formatMoney } from '@/lib/format'
import type {
  ReservationPaymentStatus,
  ReservationWithGuestRoom,
} from '@/lib/schemas/reservation'

const PAYMENT_BADGE: Record<ReservationPaymentStatus, 'success' | 'warning' | 'destructive'> = {
  paid: 'success',
  deposit: 'warning',
  unpaid: 'destructive',
}

const STATUS_LABEL: Record<ReservationWithGuestRoom['status'], string> = {
  pending: 'Pending reservation',
  checked_in: 'Checked in',
  cancelled: 'Cancelled',
}

export function ReservationDetailSheet({
  open,
  onOpenChange,
  hotelId,
  reservation,
  onViewStay,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  reservation: ReservationWithGuestRoom | null
  onViewStay: (stayId: string) => void
}) {
  const { hotel } = useActiveHotel()
  const checkIn = useReservationCheckIn(hotelId)
  const cancel = useCancelReservation(hotelId)

  if (!reservation) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Room {reservation.room.number} — {reservation.guest.name}
          </SheetTitle>
          <SheetDescription>{STATUS_LABEL[reservation.status]}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Expected Check-in</p>
              <p className="font-medium">
                {new Date(reservation.expectedCheckInAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Expected Check-out</p>
              <p className="font-medium">
                {new Date(reservation.expectedCheckOutAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment Status</p>
              <Badge variant={PAYMENT_BADGE[reservation.paymentStatus]}>
                {reservation.paymentStatus}
              </Badge>
            </div>
            {reservation.depositAmount != null && (
              <div>
                <p className="text-muted-foreground">Deposit</p>
                <p className="font-medium">
                  {formatMoney(reservation.depositAmount, hotel?.currency)}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="text-sm">
            <p className="text-muted-foreground">Guest Phone</p>
            <p className="font-medium">{reservation.guest.phone ?? '—'}</p>
          </div>
        </div>

        <SheetFooter>
          {reservation.status === 'pending' && (
            <>
              <Button
                variant="outline"
                disabled={cancel.isPending}
                onClick={() =>
                  cancel.mutate(reservation.id, { onSuccess: () => onOpenChange(false) })
                }
              >
                Cancel Reservation
              </Button>
              <Button
                disabled={checkIn.isPending}
                onClick={() =>
                  checkIn.mutate(reservation.id, { onSuccess: () => onOpenChange(false) })
                }
              >
                {checkIn.isPending ? 'Checking in…' : 'Check In'}
              </Button>
            </>
          )}
          {reservation.status === 'checked_in' && reservation.stayId && (
            <Button
              onClick={() => {
                onViewStay(reservation.stayId as string)
                onOpenChange(false)
              }}
            >
              View Stay
            </Button>
          )}
          {(checkIn.isError || cancel.isError) && (
            <p className="text-sm text-destructive">
              {checkIn.error?.message ?? cancel.error?.message}
            </p>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
