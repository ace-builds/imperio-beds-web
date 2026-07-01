import { apiFetch } from './client'
import type { AuditLogFilters, AuditLogListResponse } from '@/lib/schemas/audit-log'

const PAGE_SIZE = 25

export function listAuditLogs(hotelId: string, filters: AuditLogFilters) {
  const params = new URLSearchParams({ page: String(filters.page), pageSize: String(PAGE_SIZE) })
  if (filters.from) params.set('from', filters.from.toISOString())
  if (filters.to) params.set('to', filters.to.toISOString())
  if (filters.actorId) params.set('actorId', filters.actorId)
  if (filters.entity) params.set('entity', filters.entity)

  return apiFetch<AuditLogListResponse>(`/hotels/${hotelId}/audit-logs?${params.toString()}`, {
    hotelId,
  })
}
