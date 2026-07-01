import { z } from 'zod'

// Duplicated from the server's src/schemas/audit.schema.ts — no shared
// package across repos, kept in sync by hand per project convention.
export const AUDIT_LOG_ENTITIES = [
  'Hotel',
  'HotelStaff',
  'HotelInvite',
  'Room',
  'RoomType',
  'Guest',
  'Stay',
  'Reservation',
  'InventoryCategory',
  'InventoryItem',
  'StockMovement',
] as const

export const auditLogSchema = z.object({
  id: z.string(),
  actorId: z.string().nullable(),
  hotelId: z.string().nullable(),
  action: z.string(),
  entity: z.string(),
  entityId: z.string().nullable(),
  metadata: z.unknown().nullable(),
  createdAt: z.coerce.date(),
})

export type AuditLog = z.infer<typeof auditLogSchema>

export const auditLogListResponseSchema = z.object({
  data: z.array(auditLogSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})

export type AuditLogListResponse = z.infer<typeof auditLogListResponseSchema>

export interface AuditLogFilters {
  from?: Date
  to?: Date
  actorId?: string
  entity?: string
  page: number
}
