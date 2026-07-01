import { z } from 'zod'
import { guestSchema } from '@/lib/schemas/guest'
import { roomSchema } from '@/lib/schemas/room'

// Duplicated from the server's src/schemas/reservation.schema.ts — no shared
// package across repos, kept in sync by hand per project convention.
export const RESERVATION_STATUSES = ['pending', 'checked_in', 'cancelled'] as const

export const reservationStatusSchema = z.enum(RESERVATION_STATUSES)

export type ReservationStatus = z.infer<typeof reservationStatusSchema>

export const RESERVATION_PAYMENT_STATUSES = ['unpaid', 'deposit', 'paid'] as const

export const reservationPaymentStatusSchema = z.enum(RESERVATION_PAYMENT_STATUSES)

export type ReservationPaymentStatus = z.infer<typeof reservationPaymentStatusSchema>

export const reservationSchema = z.object({
  id: z.string(),
  hotelId: z.string(),
  guestId: z.string(),
  roomId: z.string(),
  status: reservationStatusSchema,
  expectedCheckInAt: z.coerce.date(),
  expectedCheckOutAt: z.coerce.date(),
  paymentStatus: reservationPaymentStatusSchema,
  depositAmount: z.number().positive().nullable(),
  stayId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Reservation = z.infer<typeof reservationSchema>

// What the reservations endpoints return: a Reservation joined with its
// Guest and Room.
export const reservationWithGuestRoomSchema = reservationSchema.extend({
  guest: guestSchema,
  room: roomSchema,
})

export type ReservationWithGuestRoom = z.infer<typeof reservationWithGuestRoomSchema>

export const createReservationSchema = z.object({
  guestId: z.string(),
  roomId: z.string(),
  expectedCheckInAt: z.coerce.date(),
  expectedCheckOutAt: z.coerce.date(),
  paymentStatus: reservationPaymentStatusSchema.optional(),
  depositAmount: z.number().positive().optional(),
})

export type CreateReservationInput = z.infer<typeof createReservationSchema>

export const updateReservationSchema = z.object({
  roomId: z.string().optional(),
  expectedCheckInAt: z.coerce.date().optional(),
  expectedCheckOutAt: z.coerce.date().optional(),
  paymentStatus: reservationPaymentStatusSchema.optional(),
  depositAmount: z.number().positive().optional(),
})

export type UpdateReservationInput = z.infer<typeof updateReservationSchema>
