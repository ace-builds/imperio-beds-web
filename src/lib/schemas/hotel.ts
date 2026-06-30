import { z } from 'zod'

// Duplicated from the server's src/schemas/role.schema.ts — no shared package
// across repos, kept in sync by hand per project convention.
export const ROLES = [
  'owner_admin',
  'manager',
  'front_desk',
  'storekeeper',
  'accountant',
  'housekeeping',
  'maintenance',
] as const

export const roleSchema = z.enum(ROLES)

export type Role = z.infer<typeof roleSchema>

export const invitableRoleSchema = roleSchema.exclude(['owner_admin'])

export const hotelSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  ownerId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Hotel = z.infer<typeof hotelSchema>

export const createHotelSchema = z.object({
  name: z.string().min(1),
})

export type CreateHotelInput = z.infer<typeof createHotelSchema>

export const hotelAccessItemSchema = z.object({
  hotelId: z.string(),
  hotelName: z.string(),
  role: roleSchema,
})

export type HotelAccessItem = z.infer<typeof hotelAccessItemSchema>

export const createInviteSchema = z.object({
  email: z.email(),
  role: invitableRoleSchema,
})

export type CreateInviteInput = z.infer<typeof createInviteSchema>

export const hotelStaffSchema = z.object({
  id: z.string(),
  userId: z.string(),
  hotelId: z.string(),
  role: roleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type HotelStaff = z.infer<typeof hotelStaffSchema>

export const hotelInviteSchema = z.object({
  id: z.string(),
  hotelId: z.string(),
  email: z.email(),
  role: roleSchema,
  status: z.enum(['pending', 'accepted', 'cancelled', 'expired']),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
})

export type HotelInvite = z.infer<typeof hotelInviteSchema>

export const invitePreviewSchema = z.object({
  hotelName: z.string(),
  role: roleSchema,
  email: z.email(),
  status: z.enum(['pending', 'accepted', 'cancelled', 'expired']),
})

export type InvitePreview = z.infer<typeof invitePreviewSchema>
