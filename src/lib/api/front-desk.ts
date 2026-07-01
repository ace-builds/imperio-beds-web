import { apiFetch } from './client'
import type {
  CheckInInput,
  CreatePaymentInput,
  CreateStayNoteInput,
  ExtendStayInput,
  MoveStayInput,
  Stay,
  StayDetail,
  StayNote,
  StayStatus,
  StayWithGuestRoom,
} from '@/lib/schemas/stay'

export function listStays(hotelId: string, status?: StayStatus) {
  const search = status ? `?status=${status}` : ''
  return apiFetch<StayWithGuestRoom[]>(`/hotels/${hotelId}/stays${search}`, { hotelId })
}

export function getStay(hotelId: string, stayId: string) {
  return apiFetch<StayDetail>(`/hotels/${hotelId}/stays/${stayId}`, { hotelId })
}

export function checkIn(hotelId: string, input: CheckInInput) {
  return apiFetch<Stay>(`/hotels/${hotelId}/stays`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function extendStay(hotelId: string, stayId: string, input: ExtendStayInput) {
  return apiFetch<Stay>(`/hotels/${hotelId}/stays/${stayId}/extend`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function moveStay(hotelId: string, stayId: string, input: MoveStayInput) {
  return apiFetch<Stay>(`/hotels/${hotelId}/stays/${stayId}/move`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function checkOut(hotelId: string, stayId: string) {
  return apiFetch<Stay>(`/hotels/${hotelId}/stays/${stayId}/check-out`, {
    method: 'PATCH',
    hotelId,
  })
}

export function addStayNote(hotelId: string, stayId: string, input: CreateStayNoteInput) {
  return apiFetch<StayNote>(`/hotels/${hotelId}/stays/${stayId}/notes`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function addPayment(hotelId: string, stayId: string, input: CreatePaymentInput) {
  return apiFetch<StayDetail>(`/hotels/${hotelId}/stays/${stayId}/payments`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}
