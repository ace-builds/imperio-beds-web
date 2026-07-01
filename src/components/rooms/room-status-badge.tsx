import { Badge } from '@/components/ui/badge'
import type { RoomStatus } from '@/lib/schemas/room'

const STATUS_CONFIG: Record<RoomStatus, { label: string; variant: 'success' | 'destructive' | 'warning' | 'info' }> = {
  available: { label: 'Available', variant: 'success' },
  occupied: { label: 'Occupied', variant: 'destructive' },
  cleaning: { label: 'Dirty', variant: 'warning' },
  maintenance: { label: 'Maintenance', variant: 'info' },
}

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function roomStatusLabel(status: RoomStatus) {
  return STATUS_CONFIG[status].label
}

export const STATUS_DOT_CLASS: Record<RoomStatus, string> = {
  available: 'bg-success',
  occupied: 'bg-destructive',
  cleaning: 'bg-warning',
  maintenance: 'bg-primary',
}
