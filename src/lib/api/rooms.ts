import { apiFetch } from './client'
import type {
  CreateRoomInput,
  CreateRoomNoteInput,
  Room,
  RoomNote,
  RoomStatus,
  RoomWithDetails,
  UpdateRoomInput,
} from '@/lib/schemas/room'

export function listRooms(hotelId: string) {
  return apiFetch<RoomWithDetails[]>(`/hotels/${hotelId}/rooms`, { hotelId })
}

export function createRoom(hotelId: string, input: CreateRoomInput) {
  return apiFetch<Room>(`/hotels/${hotelId}/rooms`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function updateRoom(hotelId: string, roomId: string, input: UpdateRoomInput) {
  return apiFetch<Room>(`/hotels/${hotelId}/rooms/${roomId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function deleteRoom(hotelId: string, roomId: string) {
  return apiFetch<void>(`/hotels/${hotelId}/rooms/${roomId}`, { method: 'DELETE', hotelId })
}

export function updateRoomStatus(hotelId: string, roomId: string, status: RoomStatus) {
  return apiFetch<Room>(`/hotels/${hotelId}/rooms/${roomId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    hotelId,
  })
}

export function addRoomNote(hotelId: string, roomId: string, input: CreateRoomNoteInput) {
  return apiFetch<RoomNote>(`/hotels/${hotelId}/rooms/${roomId}/notes`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}
