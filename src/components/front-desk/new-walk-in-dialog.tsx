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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GuestPicker } from '@/components/guest-picker'
import { useCheckIn } from '@/hooks/use-stays'
import type { Guest } from '@/lib/schemas/guest'
import type { RoomWithDetails } from '@/lib/schemas/room'

function tomorrow() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date
}

export function NewWalkInDialog({
  open,
  onOpenChange,
  hotelId,
  availableRooms,
  initialRoomId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  availableRooms: RoomWithDetails[]
  initialRoomId?: string
}) {
  const [guest, setGuest] = useState<Guest | null>(null)
  const [roomId, setRoomId] = useState('')
  const [checkOutDate, setCheckOutDate] = useState(tomorrow())

  const checkIn = useCheckIn(hotelId)

  useEffect(() => {
    if (!open) return
    setGuest(null)
    setRoomId(initialRoomId ?? '')
    setCheckOutDate(tomorrow())
    checkIn.reset()
  }, [open, initialRoomId])

  function handleSubmit() {
    if (!guest || !roomId) return
    checkIn.mutate(
      { guestId: guest.id, roomId, expectedCheckOutAt: checkOutDate },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Walk-in</DialogTitle>
          <DialogDescription>Check a guest in immediately.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Guest</FieldLabel>
            <GuestPicker hotelId={hotelId} value={guest} onChange={setGuest} />
          </Field>
          <Field>
            <FieldLabel htmlFor="walk-in-room">Room</FieldLabel>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger id="walk-in-room" className="w-full">
                <SelectValue placeholder="Select an available room" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.number} — {room.roomType.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Expected Checkout</FieldLabel>
            <DatePicker date={checkOutDate} onDateChange={setCheckOutDate} />
          </Field>
        </FieldGroup>
        {checkIn.isError && <p className="text-sm text-destructive">{checkIn.error.message}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!guest || !roomId || checkIn.isPending}>
            {checkIn.isPending ? 'Checking in…' : 'Check In'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
