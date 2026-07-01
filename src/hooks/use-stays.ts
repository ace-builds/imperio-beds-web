import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { combineLatest, map } from 'rxjs'
import {
  addPayment,
  addStayNote,
  checkIn,
  checkOut,
  getStay,
} from '@/lib/api/front-desk'
import { useRxDatabase } from './use-rx-database'
import { useRxQuery } from './use-rx-collection-query'
import type { StayDoc } from '@/lib/db'
import type {
  CheckInInput,
  CreatePaymentInput,
  ExtendStayInput,
  MoveStayInput,
  StayStatus,
  StayWithGuestRoom,
} from '@/lib/schemas/stay'

// Stay reads/edits are RxDB-backed for the fields that matter for the
// offline "two staff editing the same stay" scenario (list view, extend,
// move — see field-merge conflict resolution server-side). Check-in and
// check-out stay REST+TanStack Query: both have business rules (rate
// snapshot + double-booking guard; balance-owed guard) that don't safely
// generalize to a blind offline write, so the server's sync push endpoint
// deliberately doesn't accept them either (see FrontDeskService.pushChanges).
// The single-stay detail view (balance/payments/notes, all server-computed
// or append-only) also stays REST — see useStay below.

function toStayWithGuestRoom(
  stay: StayDoc,
  guestById: Map<string, ReturnType<typeof toGuestPart>>,
  roomById: Map<string, ReturnType<typeof toRoomPart>>,
): StayWithGuestRoom | null {
  const guest = guestById.get(stay.guestId)
  const room = roomById.get(stay.roomId)
  if (!guest || !room) return null
  return {
    ...stay,
    checkInAt: new Date(stay.checkInAt),
    expectedCheckOutAt: new Date(stay.expectedCheckOutAt),
    checkOutAt: stay.checkOutAt ? new Date(stay.checkOutAt) : null,
    createdAt: new Date(stay.createdAt),
    updatedAt: new Date(stay.updatedAt),
    guest,
    room,
  }
}

function toGuestPart(doc: { id: string; hotelId: string; name: string; phone: string | null; email: string | null; createdAt: string; updatedAt: string }) {
  return { ...doc, createdAt: new Date(doc.createdAt), updatedAt: new Date(doc.updatedAt) }
}

function toRoomPart(doc: {
  id: string
  hotelId: string
  roomTypeId: string
  number: string
  status: string
  pricePerNight: number | null
  createdAt: string
  updatedAt: string
}) {
  return { ...doc, createdAt: new Date(doc.createdAt), updatedAt: new Date(doc.updatedAt) } as StayWithGuestRoom['room']
}

export function useStays(hotelId: string, status?: StayStatus) {
  const db = useRxDatabase()

  const query$ = useMemo(() => {
    if (!db || !hotelId) return null
    return combineLatest([
      db.stays.find({ selector: { hotelId, ...(status ? { status } : {}) } }).$,
      db.guests.find({ selector: { hotelId } }).$,
      db.rooms.find({ selector: { hotelId } }).$,
    ]).pipe(
      map(([stayDocs, guestDocs, roomDocs]) => {
        const guestById = new Map(guestDocs.map((doc) => [doc.id, toGuestPart(doc.toJSON())]))
        const roomById = new Map(roomDocs.map((doc) => [doc.id, toRoomPart(doc.toJSON())]))
        const stays: StayWithGuestRoom[] = []
        for (const doc of stayDocs) {
          const stay = toStayWithGuestRoom(doc.toJSON(), guestById, roomById)
          if (stay) stays.push(stay)
        }
        return stays.sort((a, b) => b.checkInAt.getTime() - a.checkInAt.getTime())
      }),
    )
  }, [db, hotelId, status])

  const { data, isLoading } = useRxQuery(query$)
  return { data, isLoading, isError: false, error: null as Error | null }
}

// Single-stay detail (balance/payments/notes) stays REST — see file header.
export function useStay(hotelId: string, stayId: string | undefined) {
  return useQuery({
    queryKey: ['hotels', hotelId, 'stays', 'detail', stayId],
    queryFn: () => getStay(hotelId, stayId as string),
    enabled: !!hotelId && !!stayId,
  })
}

// No onSuccess invalidation needed: useStays reads live from RxDB, and the
// server's checkIn already emits a syncChanged('stays')/('rooms') socket
// event that triggers a replication resync — the local collections update
// themselves shortly after this REST call resolves.
export function useCheckIn(hotelId: string) {
  return useMutation({
    mutationFn: (input: CheckInInput) => checkIn(hotelId, input),
  })
}

export function useExtendStay(hotelId: string) {
  const db = useRxDatabase()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ stayId, input }: { stayId: string; input: ExtendStayInput }) => {
      if (!db) throw new Error('Local database is not ready yet')
      const doc = await db.stays.findOne(stayId).exec()
      if (!doc || doc.hotelId !== hotelId) throw new Error('Stay not found')
      await doc.incrementalPatch({
        expectedCheckOutAt: input.expectedCheckOutAt.toISOString(),
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: (_data, { stayId }) => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'stays', 'detail', stayId] })
    },
  })
}

export function useMoveStay(hotelId: string) {
  const db = useRxDatabase()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ stayId, input }: { stayId: string; input: MoveStayInput }) => {
      if (!db) throw new Error('Local database is not ready yet')
      const stayDoc = await db.stays.findOne(stayId).exec()
      if (!stayDoc || stayDoc.hotelId !== hotelId) throw new Error('Stay not found')
      const previousRoomId = stayDoc.roomId
      const now = new Date().toISOString()

      await stayDoc.incrementalPatch({ roomId: input.roomId, updatedAt: now })

      // Optimistically flip both rooms locally too, so the room board
      // reflects the move instantly even offline — the server does the
      // same flip when the push lands, and the eventual pull reconciles
      // either way (see FrontDeskService.flipRoomStatus).
      const [previousRoomDoc, newRoomDoc] = await Promise.all([
        db.rooms.findOne(previousRoomId).exec(),
        db.rooms.findOne(input.roomId).exec(),
      ])
      await Promise.all([
        previousRoomDoc?.incrementalPatch({ status: 'available', updatedAt: now }),
        newRoomDoc?.incrementalPatch({ status: 'occupied', updatedAt: now }),
      ])
    },
    onSuccess: (_data, { stayId }) => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'stays', 'detail', stayId] })
    },
  })
}

// Same reasoning as useCheckIn above — no invalidation needed.
export function useCheckOut(hotelId: string) {
  return useMutation({
    mutationFn: (stayId: string) => checkOut(hotelId, stayId),
  })
}

export function useAddStayNote(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ stayId, body }: { stayId: string; body: string }) =>
      addStayNote(hotelId, stayId, { body }),
    onSuccess: (_data, { stayId }) => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'stays', 'detail', stayId] })
    },
  })
}

export function useAddPayment(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ stayId, input }: { stayId: string; input: CreatePaymentInput }) =>
      addPayment(hotelId, stayId, input),
    onSuccess: (_data, { stayId }) => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'stays', 'detail', stayId] })
    },
  })
}
