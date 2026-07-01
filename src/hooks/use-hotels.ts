import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelInvite,
  createHotel,
  createInvite,
  deleteHotel,
  listMyHotels,
  listStaffAndInvites,
  removeStaff,
  updateHotel,
} from '@/lib/api/hotels'
import type { CreateHotelInput, CreateInviteInput } from '@/lib/schemas/hotel'
import { useCurrentHotelStore } from '@/stores/current-hotel'

export function useMyHotels() {
  return useQuery({ queryKey: ['hotels'], queryFn: listMyHotels })
}

export function useActiveHotel() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId)
  const { data: hotels, isLoading } = useMyHotels()
  const hotel = hotels?.find((item) => item.id === activeHotelId)
  return { hotel, isLoading }
}

export function useCreateHotel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateHotelInput) => createHotel(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels'] })
      void queryClient.invalidateQueries({ queryKey: ['hotel-access'] })
    },
  })
}

export function useUpdateHotel(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<CreateHotelInput>) => updateHotel(hotelId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels'] })
      void queryClient.invalidateQueries({ queryKey: ['hotel-access'] })
    },
  })
}

export function useDeleteHotel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (hotelId: string) => deleteHotel(hotelId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels'] })
      void queryClient.invalidateQueries({ queryKey: ['hotel-access'] })
    },
  })
}

export function useHotelStaff(hotelId: string) {
  return useQuery({
    queryKey: ['hotels', hotelId, 'staff'],
    queryFn: () => listStaffAndInvites(hotelId),
    enabled: !!hotelId,
  })
}

export function useCreateInvite(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateInviteInput) => createInvite(hotelId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'staff'] })
    },
  })
}

export function useRemoveStaff(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (staffId: string) => removeStaff(hotelId, staffId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'staff'] })
    },
  })
}

export function useCancelInvite(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inviteId: string) => cancelInvite(hotelId, inviteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'staff'] })
    },
  })
}
