import { useQuery } from '@tanstack/react-query'
import { getDailyReport, getReportSummary } from '@/lib/api/reports'

const dailyReportKey = (hotelId: string, date: string) => [
  'hotels',
  hotelId,
  'reports',
  'daily',
  date,
]

export function useDailyReport(hotelId: string, date: Date) {
  const dateStr = date.toISOString().slice(0, 10)
  return useQuery({
    queryKey: dailyReportKey(hotelId, dateStr),
    queryFn: () => getDailyReport(hotelId, date),
    enabled: !!hotelId,
  })
}

const reportSummaryKey = (hotelId: string, from: string, to: string) => [
  'hotels',
  hotelId,
  'reports',
  'summary',
  from,
  to,
]

export function useReportSummary(hotelId: string, from: Date, to: Date) {
  const fromStr = from.toISOString().slice(0, 10)
  const toStr = to.toISOString().slice(0, 10)
  return useQuery({
    queryKey: reportSummaryKey(hotelId, fromStr, toStr),
    queryFn: () => getReportSummary(hotelId, from, to),
    enabled: !!hotelId,
  })
}
