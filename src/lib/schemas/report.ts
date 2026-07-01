import { z } from 'zod'

// Duplicated from the server's src/schemas/report.schema.ts —
// no shared package across repos, kept in sync by hand per project convention.

export const occupancySnapshotSchema = z.object({
  total: z.number(),
  available: z.number(),
  occupied: z.number(),
  cleaning: z.number(),
  maintenance: z.number(),
  occupancyRate: z.number(),
})
export type OccupancySnapshot = z.infer<typeof occupancySnapshotSchema>

export const reportStaySchema = z.object({
  id: z.string(),
  guestName: z.string(),
  roomNumber: z.string(),
  checkInAt: z.coerce.date(),
  checkOutAt: z.coerce.date().nullable(),
  totalPaid: z.number(),
  balance: z.number(),
})
export type ReportStay = z.infer<typeof reportStaySchema>

export const inventoryUsageSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  unit: z.string(),
  quantityUsed: z.number(),
  currentStock: z.number(),
  isLowStock: z.boolean(),
})
export type InventoryUsage = z.infer<typeof inventoryUsageSchema>

export const dailyReportSchema = z.object({
  date: z.coerce.date(),
  checkIns: z.array(reportStaySchema),
  checkOuts: z.array(reportStaySchema),
  occupancy: occupancySnapshotSchema,
  revenue: z.object({
    totalPaymentsToday: z.number(),
    totalOutstandingBalance: z.number(),
  }),
  inventoryUsage: z.array(inventoryUsageSchema),
})
export type DailyReport = z.infer<typeof dailyReportSchema>
