import { apiFetch } from './client'
import type { DailyReport, ReportSummary } from '@/lib/schemas/report'

export function getDailyReport(hotelId: string, date?: Date) {
  const qs = date ? `?date=${date.toISOString().slice(0, 10)}` : ''
  return apiFetch<DailyReport>(`/hotels/${hotelId}/reports/daily${qs}`, { hotelId })
}

export function getReportSummary(hotelId: string, from: Date, to: Date) {
  const qs = `?from=${from.toISOString().slice(0, 10)}&to=${to.toISOString().slice(0, 10)}`
  return apiFetch<ReportSummary>(`/hotels/${hotelId}/reports/summary${qs}`, { hotelId })
}
