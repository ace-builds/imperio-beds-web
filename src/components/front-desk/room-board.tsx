import { useMemo, useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { RoomCard } from '@/components/front-desk/room-card'
import type { RoomStatus, RoomWithDetails } from '@/lib/schemas/room'
import type { StayWithGuestRoom } from '@/lib/schemas/stay'

const FILTERS: { label: string; value: RoomStatus | 'all' }[] = [
  { label: 'All Rooms', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Occupied', value: 'occupied' },
  { label: 'Dirty', value: 'cleaning' },
]

export function RoomBoard({
  hotelId,
  rooms,
  activeStays,
  onCheckIn,
  onViewStay,
  onAddNote,
}: {
  hotelId: string
  rooms: RoomWithDetails[]
  activeStays: StayWithGuestRoom[]
  onCheckIn: (roomId: string) => void
  onViewStay: (stay: StayWithGuestRoom) => void
  onAddNote: (room: RoomWithDetails) => void
}) {
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all')

  const stayByRoomId = useMemo(() => {
    const map = new Map<string, StayWithGuestRoom>()
    for (const stay of activeStays) map.set(stay.roomId, stay)
    return map
  }, [activeStays])

  const filteredRooms = filter === 'all' ? rooms : rooms.filter((room) => room.status === filter)

  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup
        type="single"
        variant="outline"
        value={filter}
        onValueChange={(value) => value && setFilter(value as RoomStatus | 'all')}
      >
        {FILTERS.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {filteredRooms.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No rooms match this filter.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              hotelId={hotelId}
              room={room}
              stay={stayByRoomId.get(room.id)}
              onCheckIn={onCheckIn}
              onViewStay={onViewStay}
              onAddNote={onAddNote}
            />
          ))}
        </div>
      )}
    </div>
  )
}
