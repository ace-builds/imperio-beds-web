import { formatDistanceToNowStrict } from 'date-fns'
import type { Currency } from '@/lib/schemas/hotel'

export function formatMoney(amount: number, currency: Currency | null | undefined) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency ?? 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatLastActive(date: Date | null | undefined) {
  if (!date) return 'Never'
  const seconds = (Date.now() - date.getTime()) / 1000
  if (seconds < 60) return 'Just now'
  return `${formatDistanceToNowStrict(date)} ago`
}
