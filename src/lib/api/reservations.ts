import { apiFetch } from './client'
import type {
  CreateReservationInput,
  ReservationStatus,
  ReservationWithGuestRoom,
  UpdateReservationInput,
} from '@/lib/schemas/reservation'

export function listReservations(hotelId: string, status?: ReservationStatus) {
  const search = status ? `?status=${status}` : ''
  return apiFetch<ReservationWithGuestRoom[]>(`/hotels/${hotelId}/reservations${search}`, {
    hotelId,
  })
}

export function createReservation(hotelId: string, input: CreateReservationInput) {
  return apiFetch<ReservationWithGuestRoom>(`/hotels/${hotelId}/reservations`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function updateReservation(
  hotelId: string,
  reservationId: string,
  input: UpdateReservationInput,
) {
  return apiFetch<ReservationWithGuestRoom>(`/hotels/${hotelId}/reservations/${reservationId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function cancelReservation(hotelId: string, reservationId: string) {
  return apiFetch<ReservationWithGuestRoom>(
    `/hotels/${hotelId}/reservations/${reservationId}/cancel`,
    { method: 'PATCH', hotelId },
  )
}

export function checkInReservation(hotelId: string, reservationId: string) {
  return apiFetch<ReservationWithGuestRoom>(
    `/hotels/${hotelId}/reservations/${reservationId}/check-in`,
    { method: 'POST', hotelId },
  )
}
