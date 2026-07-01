import { Badge } from '@/components/ui/badge'
import type { StaffStatus } from '@/lib/schemas/hotel'

export function StaffStatusBadge({ status }: { status: StaffStatus }) {
  return status === 'active' ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="destructive">Suspended</Badge>
  )
}

export function StaffShiftBadge({ status, onDuty }: { status: StaffStatus; onDuty: boolean }) {
  if (status === 'suspended') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-destructive">
        <span className="size-1.5 rounded-full bg-destructive" />
        No Access
      </span>
    )
  }
  if (onDuty) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-success">
        <span className="size-1.5 rounded-full bg-success" />
        Clocked In
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span className="size-1.5 rounded-full bg-muted-foreground" />
      Off Duty
    </span>
  )
}
