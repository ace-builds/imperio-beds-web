import { Ban } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RoomWithDetails } from '@/lib/schemas/room'

export function BlockedRoomsPanel({
  rooms,
  onSelectRoom,
}: {
  rooms: RoomWithDetails[]
  onSelectRoom: (room: RoomWithDetails) => void
}) {
  const blockedRooms = rooms.filter((room) => room.status === 'maintenance')

  return (
    <Card className="gap-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Ban className="size-4 text-muted-foreground" />
          Blocked Rooms
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 pt-2">
        {blockedRooms.length === 0 && (
          <p className="text-sm text-muted-foreground">No rooms currently blocked.</p>
        )}
        {blockedRooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelectRoom(room)}
            className="flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
          >
            <span className="font-medium">Room {room.number}</span>
            <span className="text-xs text-muted-foreground">{room.roomType.name}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
