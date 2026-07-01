import { useEffect, useState, type FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { useCreateRoom, useUpdateRoom } from '@/hooks/use-rooms'
import { useRoomTypes } from '@/hooks/use-room-types'
import type { RoomWithDetails } from '@/lib/schemas/room'

export function RoomFormDialog({
  open,
  onOpenChange,
  hotelId,
  room,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  room?: RoomWithDetails
}) {
  const isEditing = !!room
  const { data: roomTypes } = useRoomTypes(hotelId)

  const [number, setNumber] = useState('')
  const [roomTypeId, setRoomTypeId] = useState('')
  const [pricePerNight, setPricePerNight] = useState('')

  useEffect(() => {
    if (!open) return
    setNumber(room?.number ?? '')
    setRoomTypeId(room?.roomTypeId ?? '')
    setPricePerNight(room?.pricePerNight ? String(room.pricePerNight) : '')
  }, [open, room])

  const createRoom = useCreateRoom(hotelId)
  const updateRoom = useUpdateRoom(hotelId)
  const mutation = isEditing ? updateRoom : createRoom

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const input = {
      number,
      roomTypeId,
      pricePerNight: pricePerNight ? Number(pricePerNight) : undefined,
    }
    if (isEditing) {
      updateRoom.mutate({ roomId: room.id, input }, { onSuccess: () => onOpenChange(false) })
    } else {
      createRoom.mutate(input, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Room' : 'Add Room'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update this room\'s number, type, or price override.'
              : 'Rooms inherit their room type\'s price unless you set an override.'}
          </DialogDescription>
        </DialogHeader>
        <form id="room-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="room-number">Room Number</FieldLabel>
              <Input
                id="room-number"
                required
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                placeholder="101"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="room-type">Room Type</FieldLabel>
              <Select value={roomTypeId} onValueChange={setRoomTypeId} required>
                <SelectTrigger id="room-type" className="w-full">
                  <SelectValue placeholder="Select a room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roomTypes?.map((roomType) => (
                      <SelectItem key={roomType.id} value={roomType.id}>
                        {roomType.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="room-price">
                Price / Night Override{' '}
                <span className="font-normal text-muted-foreground">
                  (optional — inherits room type's rate)
                </span>
              </FieldLabel>
              <Input
                id="room-price"
                type="number"
                min="0"
                step="0.01"
                value={pricePerNight}
                onChange={(event) => setPricePerNight(event.target.value)}
              />
            </Field>
          </FieldGroup>
        </form>
        {mutation.isError && <p className="text-sm text-destructive">{mutation.error.message}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="room-form"
            disabled={mutation.isPending || !roomTypeId}
          >
            {mutation.isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Room'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
