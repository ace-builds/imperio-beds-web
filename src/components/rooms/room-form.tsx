import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
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
import { useActiveHotel } from '@/hooks/use-hotels'
import { useCreateRoom, useUpdateRoom } from '@/hooks/use-rooms'
import { useRoomTypes } from '@/hooks/use-room-types'
import { formatMoney } from '@/lib/format'
import type { RoomWithDetails } from '@/lib/schemas/room'

export function RoomForm({ hotelId, room }: { hotelId: string; room?: RoomWithDetails }) {
  const navigate = useNavigate()
  const isEditing = !!room
  const { hotel } = useActiveHotel()
  const { data: roomTypes } = useRoomTypes(hotelId)

  const [number, setNumber] = useState(room?.number ?? '')
  const [roomTypeId, setRoomTypeId] = useState(room?.roomTypeId ?? '')
  const [pricePerNight, setPricePerNight] = useState(
    room?.pricePerNight ? String(room.pricePerNight) : '',
  )

  const createRoom = useCreateRoom(hotelId)
  const updateRoom = useUpdateRoom(hotelId)
  const mutation = isEditing ? updateRoom : createRoom

  const selectedType = roomTypes?.find((type) => type.id === roomTypeId)

  function goBack() {
    void navigate({ to: '/rooms', search: { tab: 'rooms' } })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = {
      number,
      roomTypeId,
      pricePerNight: pricePerNight ? Number(pricePerNight) : undefined,
    }
    if (isEditing) {
      updateRoom.mutate({ roomId: room.id, input }, { onSuccess: goBack })
    } else {
      createRoom.mutate(input, { onSuccess: goBack })
    }
  }

  return (
    <FormPage
      title={isEditing ? `Edit Room ${room.number}` : 'Add Room'}
      description={
        isEditing
          ? "Update this room's number, type, or price override."
          : "New rooms start as available and inherit their room type's nightly rate."
      }
      backLink={
        <FormPageBackLink to="/rooms" search={{ tab: 'rooms' }}>
          Rooms
        </FormPageBackLink>
      }
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="outline" type="button" onClick={goBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || !number.trim() || !roomTypeId}>
            {mutation.isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Room'}
          </Button>
        </>
      }
    >
      <FormSection title="Room Details" description="How this room shows up on the front-desk board.">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="room-number">Room Number</FieldLabel>
            <Input
              id="room-number"
              required
              autoFocus
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              placeholder="101"
              className="sm:w-40"
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
                      {roomType.pricePerNight !== null &&
                        ` · ${formatMoney(roomType.pricePerNight, hotel?.currency)}/night`}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {roomTypes?.length === 0 && (
              <FieldDescription>
                No room types exist yet — add one first, since every room needs a type.
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection
        title="Pricing"
        description="Leave the override empty to keep charging the room type's default rate."
      >
        <Field>
          <FieldLabel htmlFor="room-price">
            Price / Night Override{' '}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Input
            id="room-price"
            type="number"
            min="0"
            step="0.01"
            value={pricePerNight}
            onChange={(event) => setPricePerNight(event.target.value)}
            placeholder={
              selectedType?.pricePerNight ? String(selectedType.pricePerNight) : 'No default set'
            }
            className="sm:w-56"
          />
          <FieldDescription>
            {selectedType
              ? selectedType.pricePerNight !== null
                ? `${selectedType.name} charges ${formatMoney(selectedType.pricePerNight, hotel?.currency)} per night by default.`
                : `${selectedType.name} has no default rate, so this room needs its own.`
              : 'Pick a room type to see the rate this would override.'}
          </FieldDescription>
        </Field>
      </FormSection>

      <FormPageError error={mutation.error?.message} />
    </FormPage>
  )
}
