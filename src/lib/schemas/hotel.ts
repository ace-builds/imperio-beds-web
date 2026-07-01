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

// Duplicated from the server's src/schemas/hotel.schema.ts and payment.schema.ts.
export const TOTAL_ROOMS_RANGES = ['1-20', '21-50', '51-100', '100+'] as const

export type TotalRoomsRange = (typeof TOTAL_ROOMS_RANGES)[number]

export const CURRENCIES = ['NGN', 'USD', 'GHS', 'KES'] as const

export type Currency = (typeof CURRENCIES)[number]

export const PAYMENT_METHODS = ['cash', 'transfer', 'pos'] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const hotelSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  ownerId: z.string(),
  totalRoomsRange: z.enum(TOTAL_ROOMS_RANGES).nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  starRating: z.number().int().min(1).max(5).nullable(),
  checkOutTime: z.string().nullable(),
  description: z.string().nullable(),
  currency: z.enum(CURRENCIES).nullable(),
  paymentMethods: z.array(z.enum(PAYMENT_METHODS)),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Hotel = z.infer<typeof hotelSchema>

export const createHotelSchema = z.object({
  name: z.string().min(1),
  totalRoomsRange: z.enum(TOTAL_ROOMS_RANGES).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  starRating: z.number().int().min(1).max(5).optional(),
  checkOutTime: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  currency: z.enum(CURRENCIES).optional(),
  paymentMethods: z.array(z.enum(PAYMENT_METHODS)).optional(),
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

export const STAFF_STATUSES = ['active', 'suspended'] as const

export const staffStatusSchema = z.enum(STAFF_STATUSES)

export type StaffStatus = z.infer<typeof staffStatusSchema>

export const hotelStaffSchema = z.object({
  id: z.string(),
  userId: z.string(),
  hotelId: z.string(),
  role: roleSchema,
  phone: z.string().nullable(),
  status: staffStatusSchema,
  onDuty: z.boolean(),
  lastActiveAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type HotelStaff = z.infer<typeof hotelStaffSchema>

// What GET /hotels/:id/staff actually returns — HotelStaff enriched with the
// linked User's profile, since the table needs a name/email/avatar to render.
export const hotelStaffWithUserSchema = hotelStaffSchema.extend({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    image: z.string().nullable(),
  }),
})

export type HotelStaffWithUser = z.infer<typeof hotelStaffWithUserSchema>

export const updateStaffSchema = z.object({
  role: invitableRoleSchema.optional(),
  status: staffStatusSchema.optional(),
  phone: z.string().min(1).nullable().optional(),
})

export type UpdateStaffInput = z.infer<typeof updateStaffSchema>

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
