import { MoreVertical } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RoomStatusBadge, STATUS_DOT_CLASS } from '@/components/rooms/room-status-badge'
import { useUpdateRoomStatus } from '@/hooks/use-rooms'
import { cn } from '@/lib/utils'
import type { RoomWithDetails } from '@/lib/schemas/room'
import type { StayWithGuestRoom } from '@/lib/schemas/stay'

export function RoomCard({
  hotelId,
  room,
  stay,
  onCheckIn,
  onViewStay,
  onAddNote,
}: {
  hotelId: string
  room: RoomWithDetails
  stay?: StayWithGuestRoom
  onCheckIn: (roomId: string) => void
  onViewStay: (stay: StayWithGuestRoom) => void
  onAddNote: (room: RoomWithDetails) => void
}) {
  const updateStatus = useUpdateRoomStatus(hotelId)

  return (
    <Card className="gap-2 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold">{room.number}</p>
          <p className="text-sm text-muted-foreground">{room.roomType.name}</p>
        </div>
        <span className={cn('mt-1 size-2.5 rounded-full', STATUS_DOT_CLASS[room.status])} />
      </div>

      <div className="min-h-10 border-t pt-2 text-sm">
        {room.status === 'occupied' && stay && (
          <>
            <p className="font-medium">{stay.guest.name}</p>
            <p className="text-muted-foreground">
              Checkout: {new Date(stay.expectedCheckOutAt).toLocaleDateString()}
            </p>
          </>
        )}
        {room.status === 'available' && <p className="italic text-muted-foreground">Ready for check-in</p>}
        {room.status === 'cleaning' && <p className="italic text-muted-foreground">Needs housekeeping</p>}
        {room.status === 'maintenance' && (
          <p className="italic text-muted-foreground">{room.notes[0]?.body ?? 'Maintenance'}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <RoomStatusBadge status={room.status} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Room actions">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {room.status === 'available' && (
              <>
                <DropdownMenuItem onSelect={() => onCheckIn(room.id)}>Check In</DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => updateStatus.mutate({ roomId: room.id, status: 'maintenance' })}
                >
                  Mark Maintenance
                </DropdownMenuItem>
              </>
            )}
            {room.status === 'occupied' && stay && (
              <DropdownMenuItem onSelect={() => onViewStay(stay)}>View Stay</DropdownMenuItem>
            )}
            {(room.status === 'cleaning' || room.status === 'maintenance') && (
              <DropdownMenuItem
                onSelect={() => updateStatus.mutate({ roomId: room.id, status: 'available' })}
              >
                Mark Available
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => onAddNote(room)}>Add Note</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
