import { z } from 'zod'
import { paymentMethodSchema } from './stay'

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

export const revenueByMethodRowSchema = z.object({
  method: paymentMethodSchema,
  count: z.number(),
  amount: z.number(),
})
export type RevenueByMethodRow = z.infer<typeof revenueByMethodRowSchema>

export const attendanceIssueSchema = z.object({
  staffId: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  role: z.string(),
  status: z.enum(['late', 'absent']),
  lateMinutes: z.number().nullable(),
})
export type AttendanceIssue = z.infer<typeof attendanceIssueSchema>

export const staffAttendanceSummarySchema = z.object({
  scheduledCount: z.number(),
  onDutyCount: z.number(),
  issues: z.array(attendanceIssueSchema),
})
export type StaffAttendanceSummary = z.infer<typeof staffAttendanceSummarySchema>

export const dailyReportSchema = z.object({
  date: z.coerce.date(),
  checkIns: z.array(reportStaySchema),
  checkOuts: z.array(reportStaySchema),
  occupancy: occupancySnapshotSchema,
  revenue: z.object({
    totalPaymentsToday: z.number(),
    totalOutstandingBalance: z.number(),
  }),
  revenueByMethod: z.array(revenueByMethodRowSchema),
  inventoryUsage: z.array(inventoryUsageSchema),
  staffAttendance: staffAttendanceSummarySchema,
})
export type DailyReport = z.infer<typeof dailyReportSchema>

// GET /hotels/:hotelId/reports/summary — backs the This Week/This Month
// period filter. Room status, attendance, and inventory alerts stay on the
// daily report's live/current-state snapshot regardless of period; see the
// server's reportSummarySchema comment for why.
export const reportSummarySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  checkInsCount: z.number(),
  checkOutsCount: z.number(),
  revenueTotal: z.number(),
  revenueByMethod: z.array(revenueByMethodRowSchema),
})
export type ReportSummary = z.infer<typeof reportSummarySchema>
