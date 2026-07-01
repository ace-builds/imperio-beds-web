import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/date-picker'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GuestPicker } from '@/components/guest-picker'
import { useCreateReservation } from '@/hooks/use-reservations'
import type { Guest } from '@/lib/schemas/guest'
import {
  RESERVATION_PAYMENT_STATUSES,
  type ReservationPaymentStatus,
} from '@/lib/schemas/reservation'
import type { RoomWithDetails } from '@/lib/schemas/room'

function tomorrow() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date
}

const PAYMENT_STATUS_LABEL: Record<ReservationPaymentStatus, string> = {
  unpaid: 'Unpaid',
  deposit: 'Deposit',
  paid: 'Paid',
}

export function NewReservationDialog({
  open,
  onOpenChange,
  hotelId,
  bookableRooms,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  bookableRooms: RoomWithDetails[]
}) {
  const [guest, setGuest] = useState<Guest | null>(null)
  const [roomId, setRoomId] = useState('')
  const [checkInDate, setCheckInDate] = useState(new Date())
  const [checkOutDate, setCheckOutDate] = useState(tomorrow())
  const [paymentStatus, setPaymentStatus] = useState<ReservationPaymentStatus>('unpaid')
  const [depositAmount, setDepositAmount] = useState('')

  const createReservation = useCreateReservation(hotelId)

  useEffect(() => {
    if (!open) return
    setGuest(null)
    setRoomId('')
    setCheckInDate(new Date())
    setCheckOutDate(tomorrow())
    setPaymentStatus('unpaid')
    setDepositAmount('')
    createReservation.reset()
  }, [open])

  function handleSubmit() {
    if (!guest || !roomId) return
    createReservation.mutate(
      {
        guestId: guest.id,
        roomId,
        expectedCheckInAt: checkInDate,
        expectedCheckOutAt: checkOutDate,
        paymentStatus,
        depositAmount: depositAmount ? Number(depositAmount) : undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Reservation</DialogTitle>
          <DialogDescription>Hold a room for a guest arriving later.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Guest</FieldLabel>
            <GuestPicker hotelId={hotelId} value={guest} onChange={setGuest} />
          </Field>
          <Field>
            <FieldLabel htmlFor="reservation-room">Room</FieldLabel>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger id="reservation-room" className="w-full">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {bookableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.number} — {room.roomType.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Check-in</FieldLabel>
              <DatePicker date={checkInDate} onDateChange={setCheckInDate} />
            </Field>
            <Field>
              <FieldLabel>Check-out</FieldLabel>
              <DatePicker date={checkOutDate} onDateChange={setCheckOutDate} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="reservation-payment-status">Payment Status</FieldLabel>
              <Select
                value={paymentStatus}
                onValueChange={(value) => setPaymentStatus(value as ReservationPaymentStatus)}
              >
                <SelectTrigger id="reservation-payment-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {RESERVATION_PAYMENT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {PAYMENT_STATUS_LABEL[status]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="reservation-deposit">
                Deposit <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="reservation-deposit"
                type="number"
                min="0"
                step="0.01"
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
              />
            </Field>
          </div>
        </FieldGroup>
        {createReservation.isError && (
          <p className="text-sm text-destructive">{createReservation.error.message}</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!guest || !roomId || createReservation.isPending}
          >
            {createReservation.isPending ? 'Saving…' : 'Create Reservation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
