import { apiFetch } from './client'
import type { CreateRoomTypeInput, RoomType, UpdateRoomTypeInput } from '@/lib/schemas/room-type'

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

export function updateRoomType(hotelId: string, roomTypeId: string, input: UpdateRoomTypeInput) {
  return apiFetch<RoomType>(`/hotels/${hotelId}/room-types/${roomTypeId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function deleteRoomType(hotelId: string, roomTypeId: string) {
  return apiFetch<void>(`/hotels/${hotelId}/room-types/${roomTypeId}`, {
    method: 'DELETE',
    hotelId,
  })
}
