import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useUpdateRoomStatus } from '@/hooks/use-rooms'
import type { RoomWithDetails } from '@/lib/schemas/room'

export function RoomBlockSheet({
  open,
  onOpenChange,
  hotelId,
  room,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  room: RoomWithDetails | null
}) {
  const updateStatus = useUpdateRoomStatus(hotelId)

  if (!room) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Room {room.number} — Blocked</SheetTitle>
          <SheetDescription>{room.roomType.name}</SheetDescription>
        </SheetHeader>

        <div className="px-4 text-sm text-muted-foreground">
          {room.notes[0]?.body ?? 'Marked under maintenance — not bookable until cleared.'}
        </div>

        <SheetFooter>
          <Button
            disabled={updateStatus.isPending}
            onClick={() =>
              updateStatus.mutate(
                { roomId: room.id, status: 'available' },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            {updateStatus.isPending ? 'Clearing…' : 'Mark Available'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
