import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { RoomFormDialog } from '@/components/rooms/room-form-dialog'
import { RoomStats } from '@/components/rooms/room-stats'
import { RoomStatusBadge } from '@/components/rooms/room-status-badge'
import { useDeleteRoom, useRooms } from '@/hooks/use-rooms'
import { useActiveHotel } from '@/hooks/use-hotels'
import { formatMoney } from '@/lib/format'
import { ROOM_STATUSES, type RoomStatus, type RoomWithDetails } from '@/lib/schemas/room'

export function RoomsTab({ hotelId, canManage }: { hotelId: string; canManage: boolean }) {
  const { data: rooms, isLoading } = useRooms(hotelId)
  const { hotel } = useActiveHotel()
  const deleteRoom = useDeleteRoom(hotelId)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RoomWithDetails | undefined>()
  const [deleting, setDeleting] = useState<RoomWithDetails | null>(null)

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (rooms ?? []).filter((room) => {
      const matchesStatus = statusFilter === 'all' || room.status === statusFilter
      const matchesQuery =
        !query ||
        room.number.toLowerCase().includes(query) ||
        room.roomType.name.toLowerCase().includes(query)
      return matchesStatus && matchesQuery
    })
  }, [rooms, search, statusFilter])

  return (
    <div className="flex flex-col gap-4">
      <RoomStats rooms={rooms ?? []} />

      <Card className="gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <h2 className="font-heading text-base font-medium">All Rooms</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search rooms…"
                className="w-56 pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RoomStatus | 'all')}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {ROOM_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status[0].toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {canManage && (
              <Button
                onClick={() => {
                  setEditing(undefined)
                  setFormOpen(true)
                }}
              >
                <Plus data-icon="inline-start" />
                Add Room
              </Button>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Base Rate (Night)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filteredRooms.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No rooms match.
                </TableCell>
              </TableRow>
            )}
            {filteredRooms.map((room) => {
              const rate = room.pricePerNight ?? room.roomType.pricePerNight
              return (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.number}</TableCell>
                  <TableCell>{room.roomType.name}</TableCell>
                  <TableCell>{rate ? formatMoney(rate, hotel?.currency) : '–'}</TableCell>
                  <TableCell>
                    <RoomStatusBadge status={room.status} />
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-muted-foreground">
                    {room.notes[0]?.body ?? '-'}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit room"
                        onClick={() => {
                          setEditing(room)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete room"
                        onClick={() => setDeleting(room)}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      <RoomFormDialog open={formOpen} onOpenChange={setFormOpen} hotelId={hotelId} room={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete room"
        description={`Delete room "${deleting?.number}"? This only works while the room has no stay or reservation history.`}
        confirmLabel="Delete"
        destructive
        pending={deleteRoom.isPending}
        error={deleteRoom.error?.message}
        onConfirm={() => {
          if (!deleting) return
          deleteRoom.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }}
      />
    </div>
  )
}
