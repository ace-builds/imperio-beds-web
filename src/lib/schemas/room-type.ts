import { z } from 'zod'

// Duplicated from the server's src/schemas/room-type.schema.ts — no shared
// package across repos, kept in sync by hand per project convention.
export const roomTypeSchema = z.object({
  id: z.string(),
  hotelId: z.string(),
  name: z.string().min(1),
  description: z.string().nullable(),
  pricePerNight: z.number().positive().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type RoomType = z.infer<typeof roomTypeSchema>

export const createRoomTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).optional(),
  pricePerNight: z.number().positive().optional(),
})

export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>

export const updateRoomTypeSchema = createRoomTypeSchema.partial()

export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>
