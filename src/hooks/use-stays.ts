import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addPayment,
  addStayNote,
  checkIn,
  checkOut,
  extendStay,
  getStay,
  listStays,
  moveStay,
} from '@/lib/api/front-desk'
import type {
  CheckInInput,
  CreatePaymentInput,
  ExtendStayInput,
  MoveStayInput,
  StayStatus,
} from '@/lib/schemas/stay'

const staysKey = (hotelId: string, status?: StayStatus) => [
  'hotels',
  hotelId,
  'stays',
  status ?? 'all',
]

function invalidateStaysAndRooms(queryClient: ReturnType<typeof useQueryClient>, hotelId: string) {
  void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'stays'] })
  void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'rooms'] })
}

export function useStays(hotelId: string, status?: StayStatus) {
  return useQuery({
    queryKey: staysKey(hotelId, status),
    queryFn: () => listStays(hotelId, status),
    enabled: !!hotelId,
  })
}

export function useStay(hotelId: string, stayId: string | undefined) {
  return useQuery({
    queryKey: ['hotels', hotelId, 'stays', 'detail', stayId],
    queryFn: () => getStay(hotelId, stayId as string),
    enabled: !!hotelId && !!stayId,
  })
}

export function useCheckIn(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CheckInInput) => checkIn(hotelId, input),
    onSuccess: () => invalidateStaysAndRooms(queryClient, hotelId),
  })
}

export function useExtendStay(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ stayId, input }: { stayId: string; input: ExtendStayInput }) =>
      extendStay(hotelId, stayId, input),
    onSuccess: () => invalidateStaysAndRooms(queryClient, hotelId),
  })
}

export function useMoveStay(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ stayId, input }: { stayId: string; input: MoveStayInput }) =>
      moveStay(hotelId, stayId, input),
    onSuccess: () => invalidateStaysAndRooms(queryClient, hotelId),
  })
}

export function useCheckOut(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (stayId: string) => checkOut(hotelId, stayId),
    onSuccess: () => invalidateStaysAndRooms(queryClient, hotelId),
  })
}

export function useAddStayNote(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ stayId, body }: { stayId: string; body: string }) =>
      addStayNote(hotelId, stayId, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'stays'] })
    },
  })
}

export function useAddPayment(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ stayId, input }: { stayId: string; input: CreatePaymentInput }) =>
      addPayment(hotelId, stayId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'stays'] })
    },
  })
}
