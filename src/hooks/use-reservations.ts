import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelReservation,
  checkInReservation,
  createReservation,
  listReservations,
  updateReservation,
} from '@/lib/api/reservations'
import type {
  CreateReservationInput,
  ReservationStatus,
  UpdateReservationInput,
} from '@/lib/schemas/reservation'

const reservationsKey = (hotelId: string, status?: ReservationStatus) => [
  'hotels',
  hotelId,
  'reservations',
  status ?? 'all',
]

function invalidateReservationsAndStays(
  queryClient: ReturnType<typeof useQueryClient>,
  hotelId: string,
) {
  void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'reservations'] })
  void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'stays'] })
  void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'rooms'] })
}

export function useReservations(hotelId: string, status?: ReservationStatus) {
  return useQuery({
    queryKey: reservationsKey(hotelId, status),
    queryFn: () => listReservations(hotelId, status),
    enabled: !!hotelId,
  })
}

export function useCreateReservation(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateReservationInput) => createReservation(hotelId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'reservations'] })
    },
  })
}

export function useUpdateReservation(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      reservationId,
      input,
    }: {
      reservationId: string
      input: UpdateReservationInput
    }) => updateReservation(hotelId, reservationId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'reservations'] })
    },
  })
}

export function useCancelReservation(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reservationId: string) => cancelReservation(hotelId, reservationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'reservations'] })
    },
  })
}

export function useReservationCheckIn(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reservationId: string) => checkInReservation(hotelId, reservationId),
    onSuccess: () => invalidateReservationsAndStays(queryClient, hotelId),
  })
}
