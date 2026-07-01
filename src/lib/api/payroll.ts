import { apiFetch } from './client'
import type {
  PayrollEntry,
  PayrollRow,
  SetStaffSalaryInput,
  UpdatePayrollEntryInput,
} from '@/lib/schemas/payroll'

// apiFetch does a raw `res.json()` — it doesn't run responses through Zod,
// so numeric/date fields arrive as whatever JSON.stringify produced (Prisma
// Decimals serialize as numeric strings) rather than the `number`/`Date`
// types the schema declares. Hydrate the fields the UI does math/date-method
// calls on, same fix as lib/api/hotels.ts's toHotelStaffWithUser.
function toPayrollEntry(raw: PayrollEntry): PayrollEntry {
  return {
    ...raw,
    baseSalary: Number(raw.baseSalary),
    additions: Number(raw.additions),
    deductions: Number(raw.deductions),
    netPayable: Number(raw.netPayable),
    paidAt: raw.paidAt ? new Date(raw.paidAt) : null,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

function toPayrollRow(raw: PayrollRow): PayrollRow {
  return {
    ...raw,
    baseSalary: raw.baseSalary === null ? null : Number(raw.baseSalary),
    entry: raw.entry ? toPayrollEntry(raw.entry) : null,
  }
}

export async function listPayroll(hotelId: string, period: string) {
  const rows = await apiFetch<PayrollRow[]>(
    `/hotels/${hotelId}/payroll?period=${encodeURIComponent(period)}`,
    { hotelId },
  )
  return rows.map(toPayrollRow)
}

export function setStaffSalary(hotelId: string, staffId: string, input: SetStaffSalaryInput) {
  return apiFetch<unknown>(`/hotels/${hotelId}/payroll/staff/${staffId}/salary`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function runPayroll(hotelId: string, period: string) {
  return apiFetch<{ period: string; created: number }>(`/hotels/${hotelId}/payroll/run`, {
    method: 'POST',
    body: JSON.stringify({ period }),
    hotelId,
  })
}

export async function updatePayrollEntry(
  hotelId: string,
  entryId: string,
  input: UpdatePayrollEntryInput,
) {
  const entry = await apiFetch<PayrollEntry>(`/hotels/${hotelId}/payroll/entries/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    hotelId,
  })
  return toPayrollEntry(entry)
}

export async function payPayrollEntry(hotelId: string, entryId: string) {
  const entry = await apiFetch<PayrollEntry>(
    `/hotels/${hotelId}/payroll/entries/${entryId}/pay`,
    { method: 'POST', hotelId },
  )
  return toPayrollEntry(entry)
}
