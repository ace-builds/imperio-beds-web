import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRoomType, deleteRoomType, listRoomTypes, updateRoomType } from '@/lib/api/room-types'
import type { CreateRoomTypeInput, UpdateRoomTypeInput } from '@/lib/schemas/room-type'

const roomTypesKey = (hotelId: string) => ['hotels', hotelId, 'room-types']

export function useRoomTypes(hotelId: string) {
  return useQuery({
    queryKey: roomTypesKey(hotelId),
    queryFn: () => listRoomTypes(hotelId),
    enabled: !!hotelId,
  })
}

export function useCreateRoomType(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRoomTypeInput) => createRoomType(hotelId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomTypesKey(hotelId) })
    },
  })
}

export function useUpdateRoomType(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roomTypeId, input }: { roomTypeId: string; input: UpdateRoomTypeInput }) =>
      updateRoomType(hotelId, roomTypeId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomTypesKey(hotelId) })
    },
  })
}

export function useDeleteRoomType(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomTypeId: string) => deleteRoomType(hotelId, roomTypeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomTypesKey(hotelId) })
    },
  })
}
