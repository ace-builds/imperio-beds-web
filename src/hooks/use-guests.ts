import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { combineLatest, map } from 'rxjs'
import { addGuestNote, getGuest } from '@/lib/api/guests'
import { useRxDatabase } from './use-rx-database'
import { useRxQuery } from './use-rx-collection-query'
import type { GuestDoc, StayDoc } from '@/lib/db'
import type { CreateGuestInput, Guest, UpdateGuestInput } from '@/lib/schemas/guest'

function toGuest(doc: GuestDoc): Guest {
  return { ...doc, createdAt: new Date(doc.createdAt), updatedAt: new Date(doc.updatedAt) }
}

export type GuestStatus = 'checked_in' | 'past'

export interface GuestWithStats extends Guest {
  totalStays: number
  lastVisit: Date | null
  status: GuestStatus | null
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

// Same RxDB collections as useGuests/useStays, joined client-side so the
// guest list can show stay stats without a dedicated server endpoint —
// stays are already fully replicated locally for the front desk views.
export function useGuestsWithStats(hotelId: string, query?: string) {
  const db = useRxDatabase()

  const query$ = useMemo(() => {
    if (!db || !hotelId) return null
    return combineLatest([
      db.guests.find({ selector: { hotelId } }).$,
      db.stays.find({ selector: { hotelId } }).$,
    ]).pipe(
      map(([guestDocs, stayDocs]): GuestWithStats[] => {
        const staysByGuest = new Map<string, StayDoc[]>()
        for (const doc of stayDocs) {
          const stay = doc.toJSON()
          const list = staysByGuest.get(stay.guestId)
          if (list) list.push(stay)
          else staysByGuest.set(stay.guestId, [stay])
        }

        const q = query?.trim().toLowerCase()
        return guestDocs
          .map((doc): GuestWithStats => {
            const guest = toGuest(doc.toJSON())
            const stays = staysByGuest.get(guest.id) ?? []
            const lastVisit = stays.reduce<Date | null>((latest, stay) => {
              const checkInAt = new Date(stay.checkInAt)
              return !latest || checkInAt > latest ? checkInAt : latest
            }, null)
            const status: GuestStatus | null = stays.some((stay) => stay.status === 'active')
              ? 'checked_in'
              : stays.length > 0
                ? 'past'
                : null
            return { ...guest, totalStays: stays.length, lastVisit, status }
          })
          .filter((guest) => !q || guest.name.toLowerCase().includes(q) || guest.phone?.includes(q))
          .sort((a, b) => a.name.localeCompare(b.name))
      }),
    )
  }, [db, hotelId, query])

  const { data, isLoading } = useRxQuery(query$)
  return { data, isLoading }
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

// Guest detail (notes + stay history) stays REST — same reasoning as
// useStay in use-stays.ts: it's a read of server-computed/joined data with
// no offline-write requirement, so there's no need for an RxDB collection.
export function useGuest(hotelId: string, guestId: string | undefined) {
  return useQuery({
    queryKey: ['hotels', hotelId, 'guests', 'detail', guestId],
    queryFn: () => getGuest(hotelId, guestId as string),
    enabled: !!hotelId && !!guestId,
  })
}

export function useAddGuestNote(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ guestId, body }: { guestId: string; body: string }) =>
      addGuestNote(hotelId, guestId, { body }),
    onSuccess: (_data, { guestId }) => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'guests', 'detail', guestId] })
    },
  })
}
