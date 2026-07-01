import { apiFetch } from './client'
import type {
  CreateHotelInput,
  CreateInviteInput,
  Hotel,
  HotelAccessItem,
  HotelInvite,
  HotelStaff,
  HotelStaffWithUser,
  InvitePreview,
  UpdateStaffInput,
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

// apiFetch does a raw `res.json()` — it doesn't run responses through the Zod
// schemas, so date fields arrive as ISO strings despite the schema/TS types
// saying `Date`. Hydrate the fields this page actually calls Date methods on.
function toHotelStaffWithUser(raw: HotelStaffWithUser): HotelStaffWithUser {
  return {
    ...raw,
    lastActiveAt: raw.lastActiveAt ? new Date(raw.lastActiveAt) : null,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

function toHotelInvite(raw: HotelInvite): HotelInvite {
  return { ...raw, createdAt: new Date(raw.createdAt), expiresAt: new Date(raw.expiresAt) }
}

export async function listStaffAndInvites(hotelId: string) {
  const { staff, invites } = await apiFetch<{ staff: HotelStaffWithUser[]; invites: HotelInvite[] }>(
    `/hotels/${hotelId}/staff`,
    { hotelId },
  )
  return { staff: staff.map(toHotelStaffWithUser), invites: invites.map(toHotelInvite) }
}

export async function createInvite(hotelId: string, input: CreateInviteInput) {
  const invite = await apiFetch<HotelInvite>(`/hotels/${hotelId}/invites`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
  return toHotelInvite(invite)
}

export async function updateStaff(hotelId: string, staffId: string, input: UpdateStaffInput) {
  const staff = await apiFetch<HotelStaffWithUser>(`/hotels/${hotelId}/staff/${staffId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    hotelId,
  })
  return toHotelStaffWithUser(staff)
}

export async function setStaffOnDuty(hotelId: string, staffId: string, onDuty: boolean) {
  const staff = await apiFetch<HotelStaffWithUser>(
    `/hotels/${hotelId}/staff/${staffId}/${onDuty ? 'clock-in' : 'clock-out'}`,
    { method: 'POST', hotelId },
  )
  return toHotelStaffWithUser(staff)
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
