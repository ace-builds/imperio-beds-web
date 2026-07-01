import { z } from 'zod'

// Duplicated from the server's src/schemas/guest.schema.ts — no shared
// package across repos, kept in sync by hand per project convention.
export const guestSchema = z.object({
  id: z.string(),
  hotelId: z.string(),
  name: z.string().min(1),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Guest = z.infer<typeof guestSchema>

export const createGuestSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
})

export type CreateGuestInput = z.infer<typeof createGuestSchema>

export const updateGuestSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
})

export type UpdateGuestInput = z.infer<typeof updateGuestSchema>

export const guestNoteSchema = z.object({
  id: z.string(),
  guestId: z.string(),
  authorUserId: z.string().nullable(),
  body: z.string(),
  createdAt: z.coerce.date(),
})

export type GuestNote = z.infer<typeof guestNoteSchema>

export const createGuestNoteSchema = z.object({
  body: z.string().min(1),
})

export type CreateGuestNoteInput = z.infer<typeof createGuestNoteSchema>

// What GET /hotels/:hotelId/guests/:id returns: a Guest joined with its
// notes (desc by createdAt) and stay history (desc by checkInAt, each with
// its room). Stay/room shapes are duplicated (not imported from
// lib/schemas/stay.ts) to avoid a circular import — stay.ts already imports
// guestSchema from this file.
export const guestStayHistoryEntrySchema = z.object({
  id: z.string(),
  status: z.enum(['active', 'checked_out']),
  ratePerNight: z.number(),
  checkInAt: z.coerce.date(),
  expectedCheckOutAt: z.coerce.date(),
  checkOutAt: z.coerce.date().nullable(),
  room: z.object({ id: z.string(), number: z.string() }),
})

export type GuestStayHistoryEntry = z.infer<typeof guestStayHistoryEntrySchema>

export const guestDetailSchema = guestSchema.extend({
  notes: z.array(guestNoteSchema),
  stays: z.array(guestStayHistoryEntrySchema),
})

export type GuestDetail = z.infer<typeof guestDetailSchema>
