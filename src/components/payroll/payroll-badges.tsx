import { Badge } from '@/components/ui/badge'
import type { PayrollEntryStatus } from '@/lib/schemas/payroll'

const STATUS_LABEL: Record<PayrollEntryStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  paid: 'Paid',
}

const STATUS_VARIANT: Record<PayrollEntryStatus, 'warning' | 'info' | 'success'> = {
  pending: 'warning',
  processing: 'info',
  paid: 'success',
}

export function PaymentStatusBadge({ status }: { status: PayrollEntryStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
}
