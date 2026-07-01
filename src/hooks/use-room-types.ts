import { useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { map } from 'rxjs'
import { useRxDatabase } from './use-rx-database'
import { useRxQuery } from './use-rx-collection-query'
import type { RoomTypeDoc } from '@/lib/db'
import type { CreateRoomTypeInput, RoomType, UpdateRoomTypeInput } from '@/lib/schemas/room-type'

function toRoomType(doc: RoomTypeDoc): RoomType {
  return { ...doc, createdAt: new Date(doc.createdAt), updatedAt: new Date(doc.updatedAt) }
}

// RxDB-backed — see use-rooms.ts for the rationale.
export function useRoomTypes(hotelId: string) {
  const db = useRxDatabase()

  const query$ = useMemo(() => {
    if (!db || !hotelId) return null
    return db.roomTypes
      .find({ selector: { hotelId } })
      .$.pipe(map((docs): RoomType[] => docs.map((doc) => toRoomType(doc.toJSON()))))
  }, [db, hotelId])

  const { data, isLoading } = useRxQuery(query$)
  return { data, isLoading, isError: false, error: null as Error | null }
}

export function useCreateRoomType(hotelId: string) {
  const db = useRxDatabase()
  return useMutation({
    mutationFn: async (input: CreateRoomTypeInput) => {
      if (!db) throw new Error('Local database is not ready yet')
      const now = new Date().toISOString()
      const doc = await db.roomTypes.insert({
        id: crypto.randomUUID(),
        hotelId,
        name: input.name,
        description: input.description ?? null,
        pricePerNight: input.pricePerNight ?? null,
        createdAt: now,
        updatedAt: now,
        version: 0,
        _deleted: false,
      })
      return toRoomType(doc.toJSON())
    },
  })
}

export function useUpdateRoomType(hotelId: string) {
  const db = useRxDatabase()
  return useMutation({
    mutationFn: async ({
      roomTypeId,
      input,
    }: {
      roomTypeId: string
      input: UpdateRoomTypeInput
    }) => {
      if (!db) throw new Error('Local database is not ready yet')
      const doc = await db.roomTypes.findOne(roomTypeId).exec()
      if (!doc || doc.hotelId !== hotelId) throw new Error('Room type not found')
      const updated = await doc.incrementalPatch({
        ...input,
        updatedAt: new Date().toISOString(),
      })
      return toRoomType(updated.toJSON())
    },
  })
}

export function useDeleteRoomType(hotelId: string) {
  const db = useRxDatabase()
  return useMutation({
    mutationFn: async (roomTypeId: string) => {
      if (!db) throw new Error('Local database is not ready yet')
      const doc = await db.roomTypes.findOne(roomTypeId).exec()
      if (!doc || doc.hotelId !== hotelId) throw new Error('Room type not found')
      await doc.incrementalPatch({ updatedAt: new Date().toISOString(), _deleted: true })
    },
  })
}
