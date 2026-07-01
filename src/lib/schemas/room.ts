import { z } from 'zod'

// Duplicated from the server's src/schemas/room.schema.ts — no shared
// package across repos, kept in sync by hand per project convention.
export const ROOM_STATUSES = ['available', 'occupied', 'cleaning', 'maintenance'] as const

export const roomStatusSchema = z.enum(ROOM_STATUSES)

export type RoomStatus = z.infer<typeof roomStatusSchema>

export const roomNoteSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  authorUserId: z.string().nullable(),
  body: z.string(),
  createdAt: z.coerce.date(),
})

export type RoomNote = z.infer<typeof roomNoteSchema>

export const roomSchema = z.object({
  id: z.string(),
  hotelId: z.string(),
  roomTypeId: z.string(),
  number: z.string(),
  status: roomStatusSchema,
  pricePerNight: z.number().positive().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Room = z.infer<typeof roomSchema>

// What the server's findAll actually returns: a Room joined with its
// RoomType and the single most-recent RoomNote.
export const roomWithDetailsSchema = roomSchema.extend({
  roomType: z.object({
    id: z.string(),
    name: z.string(),
    pricePerNight: z.number().positive().nullable(),
  }),
  notes: z.array(roomNoteSchema),
})

export type RoomWithDetails = z.infer<typeof roomWithDetailsSchema>

export const createRoomSchema = z.object({
  roomTypeId: z.string(),
  number: z.string().min(1),
  pricePerNight: z.number().positive().optional(),
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>

export const updateRoomSchema = createRoomSchema.partial()

export type UpdateRoomInput = z.infer<typeof updateRoomSchema>

export const createRoomNoteSchema = z.object({
  body: z.string().min(1),
})

export type CreateRoomNoteInput = z.infer<typeof createRoomNoteSchema>
