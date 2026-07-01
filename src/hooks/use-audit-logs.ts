import { useQuery } from '@tanstack/react-query'
import { listAuditLogs } from '@/lib/api/audit-logs'
import type { AuditLogFilters } from '@/lib/schemas/audit-log'

// Plain TanStack Query, not RxDB — an on-demand read view, not offline-
// replicated domain data (see this repo's CLAUDE.md on when to use which).
export function useAuditLogs(hotelId: string, filters: AuditLogFilters) {
  return useQuery({
    queryKey: ['hotels', hotelId, 'audit-logs', filters],
    queryFn: () => listAuditLogs(hotelId, filters),
    enabled: !!hotelId,
  })
}
