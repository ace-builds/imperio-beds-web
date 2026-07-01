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
import { Textarea } from '@/components/ui/textarea'
import { useCreateRoomType, useUpdateRoomType } from '@/hooks/use-room-types'
import type { RoomType } from '@/lib/schemas/room-type'

export function RoomTypeFormDialog({
  open,
  onOpenChange,
  hotelId,
  roomType,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  roomType?: RoomType
}) {
  const isEditing = !!roomType
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerNight, setPricePerNight] = useState('')

  useEffect(() => {
    if (!open) return
    setName(roomType?.name ?? '')
    setDescription(roomType?.description ?? '')
    setPricePerNight(roomType?.pricePerNight ? String(roomType.pricePerNight) : '')
  }, [open, roomType])

  const createRoomType = useCreateRoomType(hotelId)
  const updateRoomType = useUpdateRoomType(hotelId)
  const mutation = isEditing ? updateRoomType : createRoomType

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const input = {
      name,
      description: description || undefined,
      pricePerNight: pricePerNight ? Number(pricePerNight) : undefined,
    }
    if (isEditing) {
      updateRoomType.mutate(
        { roomTypeId: roomType.id, input },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createRoomType.mutate(input, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Room Type' : 'Add Room Type'}</DialogTitle>
          <DialogDescription>
            Room types set the default nightly rate individual rooms can override.
          </DialogDescription>
        </DialogHeader>
        <form id="room-type-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="room-type-name">Name</FieldLabel>
              <Input
                id="room-type-name"
                required
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
                rows={2}
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
              />
            </Field>
          </FieldGroup>
        </form>
        {mutation.isError && <p className="text-sm text-destructive">{mutation.error.message}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="room-type-form" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Room Type'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
