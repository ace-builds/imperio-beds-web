import { apiFetch } from './client'
import type {
  CreateGuestInput,
  CreateGuestNoteInput,
  Guest,
  GuestDetail,
  GuestNote,
  UpdateGuestInput,
} from '@/lib/schemas/guest'

export function listGuests(hotelId: string, query?: string) {
  const search = query ? `?q=${encodeURIComponent(query)}` : ''
  return apiFetch<Guest[]>(`/hotels/${hotelId}/guests${search}`, { hotelId })
}

export function getGuest(hotelId: string, guestId: string) {
  return apiFetch<GuestDetail>(`/hotels/${hotelId}/guests/${guestId}`, { hotelId })
}

export function createGuest(hotelId: string, input: CreateGuestInput) {
  return apiFetch<Guest>(`/hotels/${hotelId}/guests`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function updateGuest(hotelId: string, guestId: string, input: UpdateGuestInput) {
  return apiFetch<Guest>(`/hotels/${hotelId}/guests/${guestId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function deleteGuest(hotelId: string, guestId: string) {
  return apiFetch<void>(`/hotels/${hotelId}/guests/${guestId}`, { method: 'DELETE', hotelId })
}

export function addGuestNote(hotelId: string, guestId: string, input: CreateGuestNoteInput) {
  return apiFetch<GuestNote>(`/hotels/${hotelId}/guests/${guestId}/notes`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}
