import { apiFetch } from './client'
import type { CreateRoomTypeInput, RoomType } from '@/lib/schemas/room-type'

export function listRoomTypes(hotelId: string) {
  return apiFetch<RoomType[]>(`/hotels/${hotelId}/room-types`, { hotelId })
}

export function createRoomType(hotelId: string, input: CreateRoomTypeInput) {
  return apiFetch<RoomType>(`/hotels/${hotelId}/room-types`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}
