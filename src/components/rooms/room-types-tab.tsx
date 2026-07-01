import { useState } from 'react'
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
import { RoomTypeFormDialog } from '@/components/rooms/room-type-form-dialog'
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

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RoomType | undefined>()
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
          <Button
            onClick={() => {
              setEditing(undefined)
              setFormOpen(true)
            }}
          >
            <Plus data-icon="inline-start" />
            Add Room Type
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
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit room type"
                    onClick={() => {
                      setEditing(roomType)
                      setFormOpen(true)
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete room type"
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

      <RoomTypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        hotelId={hotelId}
        roomType={editing}
      />

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
