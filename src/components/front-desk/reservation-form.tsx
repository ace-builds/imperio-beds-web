import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/date-picker'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormPage, FormPageBackLink, FormPageError, FormSection } from '@/components/form-page'
import { BookingSummary, resolveNightlyRate } from '@/components/front-desk/booking-summary'
import { GuestPicker } from '@/components/guest-picker'
import { useActiveHotel } from '@/hooks/use-hotels'
import { useCreateReservation } from '@/hooks/use-reservations'
import { useRooms } from '@/hooks/use-rooms'
import { formatMoney } from '@/lib/format'
import type { Guest } from '@/lib/schemas/guest'
import {
  RESERVATION_PAYMENT_STATUSES,
  type ReservationPaymentStatus,
} from '@/lib/schemas/reservation'

const PAYMENT_STATUS_LABEL: Record<ReservationPaymentStatus, string> = {
  unpaid: 'Unpaid',
  deposit: 'Deposit',
  paid: 'Paid',
}

export function ReservationForm({ hotelId }: { hotelId: string }) {
  const navigate = useNavigate()
  const { hotel } = useActiveHotel()
  const { data: rooms } = useRooms(hotelId)
  const createReservation = useCreateReservation(hotelId)

  const [guest, setGuest] = useState<Guest | null>(null)
  const [roomId, setRoomId] = useState('')
  const [checkInDate, setCheckInDate] = useState(new Date())
  const [checkOutDate, setCheckOutDate] = useState(addDays(new Date(), 1))
  const [paymentStatus, setPaymentStatus] = useState<ReservationPaymentStatus>('unpaid')
  const [depositAmount, setDepositAmount] = useState('')

  // Anything not currently occupied can be held for a future arrival —
  // the same rule the old dialog's caller applied.
  const bookableRooms = (rooms ?? []).filter((room) => room.status !== 'occupied')
  const selectedRoom = bookableRooms.find((room) => room.id === roomId)
  const deposit = depositAmount ? Number(depositAmount) : 0

  // Check-in can't be after check-out, so pushing check-in forward drags
  // check-out with it rather than leaving the form in an invalid state.
  function handleCheckInChange(date: Date) {
    setCheckInDate(date)
    if (checkOutDate <= date) setCheckOutDate(addDays(date, 1))
  }

  const depositError =
    paymentStatus === 'deposit' && deposit <= 0
      ? 'Enter the deposit amount that was collected.'
      : null

  const canSubmit = !!guest && !!roomId && !depositError && !createReservation.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!guest || !roomId || depositError) return
    createReservation.mutate(
      {
        guestId: guest.id,
        roomId,
        expectedCheckInAt: checkInDate,
        expectedCheckOutAt: checkOutDate,
        paymentStatus,
        depositAmount: deposit > 0 ? deposit : undefined,
      },
      { onSuccess: () => navigate({ to: '/front-desk' }) },
    )
  }

  return (
    <FormPage
      title="New Reservation"
      description="Hold a room for a guest arriving later. They'll show up under today's arrivals on their check-in date."
      backLink={<FormPageBackLink to="/front-desk">Front Desk</FormPageBackLink>}
      onSubmit={handleSubmit}
      aside={
        <BookingSummary
          guest={guest}
          room={selectedRoom}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          depositAmount={deposit}
          currency={hotel?.currency}
        />
      }
      actions={
        <>
          <Button variant="outline" type="button" onClick={() => navigate({ to: '/front-desk' })}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {createReservation.isPending ? 'Saving…' : 'Create Reservation'}
          </Button>
        </>
      }
    >
      <FormSection
        title="Guest"
        description="Search an existing guest by name or phone, or add a new one without leaving this page."
      >
        <Field>
          <FieldLabel>Guest</FieldLabel>
          <GuestPicker hotelId={hotelId} value={guest} onChange={setGuest} />
        </Field>
      </FormSection>

      <FormSection title="Stay Details" description="Which room is being held, and for how long.">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="reservation-room">Room</FieldLabel>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger id="reservation-room" className="w-full">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {bookableRooms.map((room) => {
                    const rate = resolveNightlyRate(room)
                    return (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.number} — {room.roomType.name}
                        {rate !== null && ` · ${formatMoney(rate, hotel?.currency)}/night`}
                      </SelectItem>
                    )
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
            {bookableRooms.length === 0 && (
              <FieldDescription>
                Every room is currently occupied — nothing can be held right now.
              </FieldDescription>
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="reservation-check-in">Check-in</FieldLabel>
              <DatePicker
                id="reservation-check-in"
                date={checkInDate}
                onDateChange={handleCheckInChange}
                className="w-full justify-start"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="reservation-check-out">Check-out</FieldLabel>
              <DatePicker
                id="reservation-check-out"
                date={checkOutDate}
                onDateChange={setCheckOutDate}
                minDate={addDays(checkInDate, 1)}
                className="w-full justify-start"
              />
            </Field>
          </div>
        </FieldGroup>
      </FormSection>

      <FormSection
        title="Payment"
        description="Record anything collected up front. The balance is settled at the front desk."
      >
        <FieldGroup>
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

          <Field data-invalid={!!depositError}>
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
              aria-invalid={!!depositError}
              placeholder="0"
            />
            <FieldError>{depositError}</FieldError>
          </Field>
        </FieldGroup>
      </FormSection>

      <FormPageError error={createReservation.error?.message} />
    </FormPage>
  )
}
