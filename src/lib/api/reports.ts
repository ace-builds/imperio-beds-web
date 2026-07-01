import { apiFetch } from './client'
import type { DailyReport } from '@/lib/schemas/report'

export function getDailyReport(hotelId: string, date?: Date) {
  const qs = date ? `?date=${date.toISOString().slice(0, 10)}` : ''
  return apiFetch<DailyReport>(`/hotels/${hotelId}/reports/daily${qs}`, { hotelId })
}
