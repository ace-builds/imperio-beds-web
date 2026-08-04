import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormPage, FormPageBackLink, FormPageError, FormSection } from '@/components/form-page'
import { useCreateRoomType, useUpdateRoomType } from '@/hooks/use-room-types'
import type { RoomType } from '@/lib/schemas/room-type'

export function RoomTypeForm({ hotelId, roomType }: { hotelId: string; roomType?: RoomType }) {
  const navigate = useNavigate()
  const isEditing = !!roomType

  const [name, setName] = useState(roomType?.name ?? '')
  const [description, setDescription] = useState(roomType?.description ?? '')
  const [pricePerNight, setPricePerNight] = useState(
    roomType?.pricePerNight ? String(roomType.pricePerNight) : '',
  )

  const createRoomType = useCreateRoomType(hotelId)
  const updateRoomType = useUpdateRoomType(hotelId)
  const mutation = isEditing ? updateRoomType : createRoomType

  function goBack() {
    void navigate({ to: '/rooms', search: { tab: 'types' } })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = {
      name,
      description: description.trim() || undefined,
      pricePerNight: pricePerNight ? Number(pricePerNight) : undefined,
    }
    if (isEditing) {
      updateRoomType.mutate({ roomTypeId: roomType.id, input }, { onSuccess: goBack })
    } else {
      createRoomType.mutate(input, { onSuccess: goBack })
    }
  }

  return (
    <FormPage
      title={isEditing ? `Edit ${roomType.name}` : 'Add Room Type'}
      description="Room types group rooms that share a nightly rate — individual rooms can still override it."
      backLink={
        <FormPageBackLink to="/rooms" search={{ tab: 'types' }}>
          Room Types
        </FormPageBackLink>
      }
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="outline" type="button" onClick={goBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || !name.trim()}>
            {mutation.isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Room Type'}
          </Button>
        </>
      }
    >
      <FormSection title="Room Type" description="What the front desk sees when picking a room.">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="room-type-name">Name</FieldLabel>
            <Input
              id="room-type-name"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Deluxe King"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="room-type-description">
              Description <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea
              id="room-type-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="King bed, en-suite bathroom, workspace, city view…"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="room-type-price">
              Default Price / Night{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              id="room-type-price"
              type="number"
              min="0"
              step="0.01"
              value={pricePerNight}
              onChange={(event) => setPricePerNight(event.target.value)}
              className="sm:w-56"
            />
            <FieldDescription>
              Every room of this type charges this rate unless it sets its own override.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FormSection>

      <FormPageError error={mutation.error?.message} />
    </FormPage>
  )
}
