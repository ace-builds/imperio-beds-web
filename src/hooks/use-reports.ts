import { useQuery } from '@tanstack/react-query'
import { getDailyReport } from '@/lib/api/reports'

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
