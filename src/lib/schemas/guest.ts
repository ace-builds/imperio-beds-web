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
