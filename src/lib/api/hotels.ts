import { apiFetch } from './client'
import type {
  CreateHotelInput,
  CreateInviteInput,
  Hotel,
  HotelAccessItem,
  HotelInvite,
  HotelStaff,
  InvitePreview,
} from '@/lib/schemas/hotel'

export function listMyHotels() {
  return apiFetch<Hotel[]>('/hotels')
}

export function createHotel(input: CreateHotelInput) {
  return apiFetch<Hotel>('/hotels', { method: 'POST', body: JSON.stringify(input) })
}

export function updateHotel(hotelId: string, input: Partial<CreateHotelInput>) {
  return apiFetch<Hotel>(`/hotels/${hotelId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function deleteHotel(hotelId: string) {
  return apiFetch<void>(`/hotels/${hotelId}`, { method: 'DELETE', hotelId })
}

export function listStaffAndInvites(hotelId: string) {
  return apiFetch<{ staff: HotelStaff[]; invites: HotelInvite[] }>(`/hotels/${hotelId}/staff`, {
    hotelId,
  })
}

export function createInvite(hotelId: string, input: CreateInviteInput) {
  return apiFetch<HotelInvite>(`/hotels/${hotelId}/invites`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function removeStaff(hotelId: string, staffId: string) {
  return apiFetch<void>(`/hotels/${hotelId}/staff/${staffId}`, { method: 'DELETE', hotelId })
}

export function cancelInvite(hotelId: string, inviteId: string) {
  return apiFetch<void>(`/hotels/${hotelId}/invites/${inviteId}`, { method: 'DELETE', hotelId })
}

export function getInvitePreview(token: string) {
  return apiFetch<InvitePreview>(`/invites/${token}`)
}

export function acceptInvite(token: string) {
  return apiFetch<HotelStaff>(`/invites/${token}/accept`, { method: 'POST' })
}

export function getMyHotelAccess() {
  return apiFetch<HotelAccessItem[]>('/me/hotel-access')
}
