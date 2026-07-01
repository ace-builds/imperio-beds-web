import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { combineLatest, map } from 'rxjs'
import { addRoomNote } from '@/lib/api/rooms'
import { useRxDatabase } from './use-rx-database'
import { useRxQuery } from './use-rx-collection-query'
import type { RoomDoc } from '@/lib/db'
import type { CreateRoomInput, Room, RoomStatus, RoomWithDetails, UpdateRoomInput } from '@/lib/schemas/room'

function toRoom(doc: RoomDoc): Room {
  return { ...doc, createdAt: new Date(doc.createdAt), updatedAt: new Date(doc.updatedAt) }
}

// Rooms/room-types are RxDB-backed (offline-first, see src/lib/db.ts) —
// reads/writes go straight to the local collection and replicate to the
// server in the background, instead of round-tripping through REST. Notes
// stay REST+TanStack Query (see useAddRoomNote below): they're append-only
// activity-log entries, out of scope for the RxDB retrofit, so the "latest
// note" preview RoomWithDetails used to carry is empty until that's added
// back — a deliberate, small UX regression, not an oversight.
export function useRooms(hotelId: string) {
  const db = useRxDatabase()

  const query$ = useMemo(() => {
    if (!db || !hotelId) return null
    return combineLatest([
      db.rooms.find({ selector: { hotelId } }).$,
      db.roomTypes.find({ selector: { hotelId } }).$,
    ]).pipe(
      map(([roomDocs, roomTypeDocs]) => {
        const roomTypeById = new Map(roomTypeDocs.map((doc) => [doc.id, doc.toJSON()]))
        const rooms: RoomWithDetails[] = []
        for (const doc of roomDocs) {
          const room = doc.toJSON()
          const roomType = roomTypeById.get(room.roomTypeId)
          if (!roomType) continue
          rooms.push({
            ...room,
            createdAt: new Date(room.createdAt),
            updatedAt: new Date(room.updatedAt),
            roomType: {
              id: roomType.id,
              name: roomType.name,
              pricePerNight: roomType.pricePerNight,
            },
            notes: [],
          })
        }
        return rooms
      }),
    )
  }, [db, hotelId])

  const { data, isLoading } = useRxQuery(query$)
  return { data, isLoading, isError: false, error: null as Error | null }
}

export function useCreateRoom(hotelId: string) {
  const db = useRxDatabase()
  return useMutation({
    mutationFn: async (input: CreateRoomInput) => {
      if (!db) throw new Error('Local database is not ready yet')
      const now = new Date().toISOString()
      const doc = await db.rooms.insert({
        id: crypto.randomUUID(),
        hotelId,
        roomTypeId: input.roomTypeId,
        number: input.number,
        status: 'available',
        pricePerNight: input.pricePerNight ?? null,
        createdAt: now,
        updatedAt: now,
        version: 0,
        _deleted: false,
      })
      return toRoom(doc.toJSON())
    },
  })
}

export function useUpdateRoom(hotelId: string) {
  const db = useRxDatabase()
  return useMutation({
    mutationFn: async ({ roomId, input }: { roomId: string; input: UpdateRoomInput }) => {
      if (!db) throw new Error('Local database is not ready yet')
      const doc = await db.rooms.findOne(roomId).exec()
      if (!doc || doc.hotelId !== hotelId) throw new Error('Room not found')
      const updated = await doc.incrementalPatch({
        ...input,
        updatedAt: new Date().toISOString(),
      })
      return toRoom(updated.toJSON())
    },
  })
}

export function useDeleteRoom(hotelId: string) {
  const db = useRxDatabase()
  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!db) throw new Error('Local database is not ready yet')
      const doc = await db.rooms.findOne(roomId).exec()
      if (!doc || doc.hotelId !== hotelId) throw new Error('Room not found')
      await doc.incrementalPatch({ updatedAt: new Date().toISOString(), _deleted: true })
    },
  })
}

export function useUpdateRoomStatus(hotelId: string) {
  const db = useRxDatabase()
  return useMutation({
    mutationFn: async ({ roomId, status }: { roomId: string; status: RoomStatus }) => {
      if (!db) throw new Error('Local database is not ready yet')
      const doc = await db.rooms.findOne(roomId).exec()
      if (!doc || doc.hotelId !== hotelId) throw new Error('Room not found')
      const updated = await doc.incrementalPatch({ status, updatedAt: new Date().toISOString() })
      return toRoom(updated.toJSON())
    },
  })
}

export function useAddRoomNote(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: string; body: string }) =>
      addRoomNote(hotelId, roomId, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'rooms'] })
    },
  })
}
