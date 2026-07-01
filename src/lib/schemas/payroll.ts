import { z } from 'zod'

// "YYYY-MM" — a payroll period is a calendar month; matches the server's
// payrollPeriodSchema (src/schemas/payroll.schema.ts).
export const payrollPeriodSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Period must be in YYYY-MM format')

export const PAYROLL_ENTRY_STATUSES = ['pending', 'processing', 'paid'] as const

export const payrollEntryStatusSchema = z.enum(PAYROLL_ENTRY_STATUSES)

export type PayrollEntryStatus = z.infer<typeof payrollEntryStatusSchema>

export const payrollEntrySchema = z.object({
  id: z.string(),
  hotelId: z.string(),
  staffId: z.string(),
  period: payrollPeriodSchema,
  baseSalary: z.number(),
  additions: z.number(),
  additionsNote: z.string().nullable(),
  deductions: z.number(),
  deductionsNote: z.string().nullable(),
  netPayable: z.number(),
  status: payrollEntryStatusSchema,
  paidAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PayrollEntry = z.infer<typeof payrollEntrySchema>

export const payrollRowSchema = z.object({
  staffId: z.string(),
  name: z.string(),
  email: z.email(),
  image: z.string().nullable(),
  role: z.string(),
  status: z.enum(['active', 'suspended']),
  baseSalary: z.number().nullable(),
  entry: payrollEntrySchema.nullable(),
})

export type PayrollRow = z.infer<typeof payrollRowSchema>

export const setStaffSalarySchema = z.object({
  baseSalary: z.number().positive(),
})

export type SetStaffSalaryInput = z.infer<typeof setStaffSalarySchema>

export const updatePayrollEntrySchema = z.object({
  additions: z.number().min(0).optional(),
  additionsNote: z.string().nullable().optional(),
  deductions: z.number().min(0).optional(),
  deductionsNote: z.string().nullable().optional(),
  status: payrollEntryStatusSchema.optional(),
})

export type UpdatePayrollEntryInput = z.infer<typeof updatePayrollEntrySchema>
