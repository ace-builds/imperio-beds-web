import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRoomType, listRoomTypes } from '@/lib/api/room-types'
import type { CreateRoomTypeInput } from '@/lib/schemas/room-type'

export function useRoomTypes(hotelId: string) {
  return useQuery({
    queryKey: ['hotels', hotelId, 'room-types'],
    queryFn: () => listRoomTypes(hotelId),
    enabled: !!hotelId,
  })
}

export function useCreateRoomType(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRoomTypeInput) => createRoomType(hotelId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'room-types'] })
    },
  })
}
