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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMoveStay, useStay } from '@/hooks/use-stays'
import type { RoomWithDetails } from '@/lib/schemas/room'

export function MoveStayDialog({
  open,
  onOpenChange,
  hotelId,
  stayId,
  availableRooms,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  stayId: string | null
  availableRooms: RoomWithDetails[]
}) {
  const { data: stay } = useStay(hotelId, stayId ?? undefined)
  const [roomId, setRoomId] = useState('')
  const moveStay = useMoveStay(hotelId)

  useEffect(() => {
    if (open) {
      setRoomId('')
      moveStay.reset()
    }
  }, [open])

  if (!stay) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Room</DialogTitle>
          <DialogDescription>
            Move {stay.guest.name} out of room {stay.room.number}.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="move-room">New Room</FieldLabel>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger id="move-room" className="w-full">
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
        </FieldGroup>
        {moveStay.isError && <p className="text-sm text-destructive">{moveStay.error.message}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!roomId || moveStay.isPending}
            onClick={() =>
              moveStay.mutate(
                { stayId: stay.id, input: { roomId } },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            {moveStay.isPending ? 'Moving…' : 'Move Room'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
