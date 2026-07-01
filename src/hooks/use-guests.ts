import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createGuest, deleteGuest, listGuests, updateGuest } from '@/lib/api/guests'
import type { CreateGuestInput, UpdateGuestInput } from '@/lib/schemas/guest'

const guestsKey = (hotelId: string, query?: string) => ['hotels', hotelId, 'guests', query ?? '']

export function useGuests(hotelId: string, query?: string) {
  return useQuery({
    queryKey: guestsKey(hotelId, query),
    queryFn: () => listGuests(hotelId, query),
    enabled: !!hotelId,
  })
}

export function useCreateGuest(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGuestInput) => createGuest(hotelId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'guests'] })
    },
  })
}

export function useUpdateGuest(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ guestId, input }: { guestId: string; input: UpdateGuestInput }) =>
      updateGuest(hotelId, guestId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'guests'] })
    },
  })
}

export function useDeleteGuest(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (guestId: string) => deleteGuest(hotelId, guestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'guests'] })
    },
  })
}
