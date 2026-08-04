import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteRoomType, useRoomTypes } from '@/hooks/use-room-types'
import { useRooms } from '@/hooks/use-rooms'
import { useActiveHotel } from '@/hooks/use-hotels'
import { formatMoney } from '@/lib/format'
import type { RoomType } from '@/lib/schemas/room-type'

export function RoomTypesTab({ hotelId, canManage }: { hotelId: string; canManage: boolean }) {
  const { data: roomTypes, isLoading } = useRoomTypes(hotelId)
  const { data: rooms } = useRooms(hotelId)
  const { hotel } = useActiveHotel()
  const deleteRoomType = useDeleteRoomType(hotelId)

  const [deleting, setDeleting] = useState<RoomType | null>(null)

  const roomCountByType = new Map<string, number>()
  for (const room of rooms ?? []) {
    roomCountByType.set(room.roomTypeId, (roomCountByType.get(room.roomTypeId) ?? 0) + 1)
  }

  return (
    <Card className="gap-0">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div>
          <h2 className="font-heading text-base font-medium">Room Types</h2>
          <p className="text-sm text-muted-foreground">
            Default nightly rates rooms inherit unless overridden.
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link to="/rooms/types/new">
              <Plus data-icon="inline-start" />
              Add Room Type
            </Link>
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Default Price / Night</TableHead>
            <TableHead>Rooms</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          )}
          {!isLoading && roomTypes?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No room types yet.
              </TableCell>
            </TableRow>
          )}
          {roomTypes?.map((roomType) => (
            <TableRow key={roomType.id}>
              <TableCell className="font-medium">{roomType.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {roomType.description ?? '–'}
              </TableCell>
              <TableCell>
                {roomType.pricePerNight ? formatMoney(roomType.pricePerNight, hotel?.currency) : '–'}
              </TableCell>
              <TableCell>{roomCountByType.get(roomType.id) ?? 0}</TableCell>
              {canManage && (
                <TableCell className="text-right">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${roomType.name}`}
                  >
                    <Link
                      to="/rooms/types/$roomTypeId/edit"
                      params={{ roomTypeId: roomType.id }}
                    >
                      <Pencil />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${roomType.name}`}
                    onClick={() => setDeleting(roomType)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete room type"
        description={`Delete "${deleting?.name}"? This can't be undone, and only works while no rooms use this type.`}
        confirmLabel="Delete"
        destructive
        pending={deleteRoomType.isPending}
        error={deleteRoomType.error?.message}
        onConfirm={() => {
          if (!deleting) return
          deleteRoomType.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }}
      />
    </Card>
  )
}
