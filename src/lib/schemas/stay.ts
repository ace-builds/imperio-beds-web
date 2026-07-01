import { z } from 'zod'
import { guestSchema } from '@/lib/schemas/guest'
import { roomSchema } from '@/lib/schemas/room'

// Duplicated from the server's src/schemas/stay.schema.ts,
// src/schemas/payment.schema.ts, and src/schemas/stay-note.schema.ts — no
// shared package across repos, kept in sync by hand per project convention.
export const STAY_STATUSES = ['active', 'checked_out'] as const

export const stayStatusSchema = z.enum(STAY_STATUSES)

export type StayStatus = z.infer<typeof stayStatusSchema>

export const staySchema = z.object({
  id: z.string(),
  hotelId: z.string(),
  guestId: z.string(),
  roomId: z.string(),
  status: stayStatusSchema,
  ratePerNight: z.number().positive(),
  checkInAt: z.coerce.date(),
  expectedCheckOutAt: z.coerce.date(),
  checkOutAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Stay = z.infer<typeof staySchema>

// What GET /stays returns: a Stay joined with its Guest and Room.
export const stayWithGuestRoomSchema = staySchema.extend({
  guest: guestSchema,
  room: roomSchema,
})

export type StayWithGuestRoom = z.infer<typeof stayWithGuestRoomSchema>

export const stayNoteSchema = z.object({
  id: z.string(),
  stayId: z.string(),
  authorUserId: z.string().nullable(),
  body: z.string(),
  createdAt: z.coerce.date(),
})

export type StayNote = z.infer<typeof stayNoteSchema>

export const PAYMENT_METHODS = ['cash', 'transfer', 'pos'] as const

export const paymentMethodSchema = z.enum(PAYMENT_METHODS)

export type PaymentMethod = z.infer<typeof paymentMethodSchema>

export const paymentSchema = z.object({
  id: z.string(),
  stayId: z.string(),
  amount: z.number().positive(),
  method: paymentMethodSchema,
  recordedByUserId: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type Payment = z.infer<typeof paymentSchema>

// What GET /stays/:id returns: a Stay with guest/room/notes/payments plus a
// server-computed balance.
export const stayDetailSchema = stayWithGuestRoomSchema.extend({
  notes: z.array(stayNoteSchema),
  payments: z.array(paymentSchema),
  nights: z.number(),
  totalDue: z.number(),
  totalPaid: z.number(),
  balance: z.number(),
})

export type StayDetail = z.infer<typeof stayDetailSchema>

export const checkInSchema = z.object({
  guestId: z.string(),
  roomId: z.string(),
  expectedCheckOutAt: z.coerce.date(),
})

export type CheckInInput = z.infer<typeof checkInSchema>

export const extendStaySchema = z.object({
  expectedCheckOutAt: z.coerce.date(),
})

export type ExtendStayInput = z.infer<typeof extendStaySchema>

export const moveStaySchema = z.object({
  roomId: z.string(),
})

export type MoveStayInput = z.infer<typeof moveStaySchema>

export const createStayNoteSchema = z.object({
  body: z.string().min(1),
})

export type CreateStayNoteInput = z.infer<typeof createStayNoteSchema>

export const createPaymentSchema = z.object({
  amount: z.number().positive(),
  method: paymentMethodSchema,
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
