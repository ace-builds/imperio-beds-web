import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addRoomNote,
  createRoom,
  deleteRoom,
  listRooms,
  updateRoom,
  updateRoomStatus,
} from '@/lib/api/rooms'
import type { CreateRoomInput, RoomStatus, UpdateRoomInput } from '@/lib/schemas/room'

const roomsKey = (hotelId: string) => ['hotels', hotelId, 'rooms']

export function useRooms(hotelId: string) {
  return useQuery({
    queryKey: roomsKey(hotelId),
    queryFn: () => listRooms(hotelId),
    enabled: !!hotelId,
  })
}

export function useCreateRoom(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRoomInput) => createRoom(hotelId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomsKey(hotelId) })
    },
  })
}

export function useUpdateRoom(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roomId, input }: { roomId: string; input: UpdateRoomInput }) =>
      updateRoom(hotelId, roomId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomsKey(hotelId) })
    },
  })
}

export function useDeleteRoom(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roomId: string) => deleteRoom(hotelId, roomId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomsKey(hotelId) })
    },
  })
}

export function useUpdateRoomStatus(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roomId, status }: { roomId: string; status: RoomStatus }) =>
      updateRoomStatus(hotelId, roomId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomsKey(hotelId) })
    },
  })
}

export function useAddRoomNote(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: string; body: string }) =>
      addRoomNote(hotelId, roomId, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomsKey(hotelId) })
    },
  })
}
