import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/date-picker'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
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
import { useRooms } from '@/hooks/use-rooms'
import { useCheckIn } from '@/hooks/use-stays'
import { formatMoney } from '@/lib/format'
import type { Guest } from '@/lib/schemas/guest'

export function WalkInForm({
  hotelId,
  initialRoomId,
}: {
  hotelId: string
  initialRoomId?: string
}) {
  const navigate = useNavigate()
  const { hotel } = useActiveHotel()
  const { data: rooms } = useRooms(hotelId)
  const checkIn = useCheckIn(hotelId)

  const [guest, setGuest] = useState<Guest | null>(null)
  // Pre-selected when the page is opened from a specific room card
  // (/front-desk/check-in?roomId=…), which the old dialog handled via a prop.
  const [roomId, setRoomId] = useState(initialRoomId ?? '')
  // A walk-in checks in now — the date is fixed, only the checkout moves.
  const [checkInDate] = useState(() => new Date())
  const [checkOutDate, setCheckOutDate] = useState(() => addDays(new Date(), 1))

  const availableRooms = (rooms ?? []).filter((room) => room.status === 'available')
  const selectedRoom = availableRooms.find((room) => room.id === roomId)

  const canSubmit = !!guest && !!roomId && !checkIn.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!guest || !roomId) return
    checkIn.mutate(
      { guestId: guest.id, roomId, expectedCheckOutAt: checkOutDate },
      { onSuccess: () => navigate({ to: '/front-desk' }) },
    )
  }

  return (
    <FormPage
      title="New Walk-in"
      description="Check a guest in immediately. The room flips to occupied as soon as this is saved."
      backLink={<FormPageBackLink to="/front-desk">Front Desk</FormPageBackLink>}
      onSubmit={handleSubmit}
      aside={
        <BookingSummary
          guest={guest}
          room={selectedRoom}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          currency={hotel?.currency}
        />
      }
      actions={
        <>
          <Button variant="outline" type="button" onClick={() => navigate({ to: '/front-desk' })}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {checkIn.isPending ? 'Checking in…' : 'Check In'}
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

      <FormSection title="Room & Dates" description="Only rooms marked available can take a walk-in.">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="walk-in-room">Room</FieldLabel>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger id="walk-in-room" className="w-full">
                <SelectValue placeholder="Select an available room" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableRooms.map((room) => {
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
            {availableRooms.length === 0 && (
              <FieldDescription>
                No rooms are available right now — free one up or clean a dirty room first.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="walk-in-check-out">Expected Checkout</FieldLabel>
            <DatePicker
              id="walk-in-check-out"
              date={checkOutDate}
              onDateChange={setCheckOutDate}
              minDate={addDays(checkInDate, 1)}
              className="w-full justify-start sm:w-64"
            />
            <FieldDescription>
              Can be extended later from the stay's detail panel.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FormSection>

      <FormPageError error={checkIn.error?.message} />
    </FormPage>
  )
}
