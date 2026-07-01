import type { Currency } from '@/lib/schemas/hotel'

export function formatMoney(amount: number, currency: Currency | null | undefined) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency ?? 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}
