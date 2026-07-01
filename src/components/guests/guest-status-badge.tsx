import { Badge } from '@/components/ui/badge'
import type { GuestStatus } from '@/hooks/use-guests'

const STATUS_CONFIG: Record<GuestStatus, { label: string; variant: 'success' | 'secondary' }> = {
  checked_in: { label: 'Checked In', variant: 'success' },
  past: { label: 'Past Guest', variant: 'secondary' },
}

export function GuestStatusBadge({ status }: { status: GuestStatus | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
