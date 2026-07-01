import { useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { map } from 'rxjs'
import { useRxDatabase } from './use-rx-database'
import { useRxQuery } from './use-rx-collection-query'
import type { GuestDoc } from '@/lib/db'
import type { CreateGuestInput, Guest, UpdateGuestInput } from '@/lib/schemas/guest'

function toGuest(doc: GuestDoc): Guest {
  return { ...doc, createdAt: new Date(doc.createdAt), updatedAt: new Date(doc.updatedAt) }
}

// RxDB-backed — see use-rooms.ts for the rationale. `query` (name/phone
// search) is filtered client-side over the locally replicated collection
// rather than server-side, since the whole point of local-first is not
// needing a round-trip for a read like this — MVP-scale guest lists are
// small enough that this is cheap.
export function useGuests(hotelId: string, query?: string) {
  const db = useRxDatabase()

  const query$ = useMemo(() => {
    if (!db || !hotelId) return null
    return db.guests.find({ selector: { hotelId } }).$.pipe(
      map((docs): Guest[] => {
        const q = query?.trim().toLowerCase()
        const guests = docs.map((doc) => toGuest(doc.toJSON()))
        if (!q) return guests.sort((a, b) => a.name.localeCompare(b.name))
        return guests
          .filter((guest) => guest.name.toLowerCase().includes(q) || guest.phone?.includes(q))
          .sort((a, b) => a.name.localeCompare(b.name))
      }),
    )
  }, [db, hotelId, query])

  const { data, isLoading } = useRxQuery(query$)
  return { data, isLoading, isFetching: isLoading, isError: false, error: null as Error | null }
}

export function useCreateGuest(hotelId: string) {
  const db = useRxDatabase()
  return useMutation({
    mutationFn: async (input: CreateGuestInput) => {
      if (!db) throw new Error('Local database is not ready yet')
      const now = new Date().toISOString()
      const doc = await db.guests.insert({
        id: crypto.randomUUID(),
        hotelId,
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        createdAt: now,
        updatedAt: now,
        version: 0,
        _deleted: false,
      })
      return toGuest(doc.toJSON())
    },
  })
}

export function useUpdateGuest(hotelId: string) {
  const db = useRxDatabase()
  return useMutation({
    mutationFn: async ({ guestId, input }: { guestId: string; input: UpdateGuestInput }) => {
      if (!db) throw new Error('Local database is not ready yet')
      const doc = await db.guests.findOne(guestId).exec()
      if (!doc || doc.hotelId !== hotelId) throw new Error('Guest not found')
      const updated = await doc.incrementalPatch({
        ...input,
        updatedAt: new Date().toISOString(),
      })
      return toGuest(updated.toJSON())
    },
  })
}

export function useDeleteGuest(hotelId: string) {
  const db = useRxDatabase()
  return useMutation({
    mutationFn: async (guestId: string) => {
      if (!db) throw new Error('Local database is not ready yet')
      const doc = await db.guests.findOne(guestId).exec()
      if (!doc || doc.hotelId !== hotelId) throw new Error('Guest not found')
      await doc.incrementalPatch({ updatedAt: new Date().toISOString(), _deleted: true })
    },
  })
}
