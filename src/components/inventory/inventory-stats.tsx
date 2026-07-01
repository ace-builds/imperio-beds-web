import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useInventoryStats } from '@/hooks/use-inventory'
import { formatMoney } from '@/lib/format'
import type { Currency } from '@/lib/schemas/hotel'

export function InventoryStats({
  hotelId,
  currency,
}: {
  hotelId: string
  currency: Currency | null | undefined
}) {
  const { data: stats, isLoading } = useInventoryStats(hotelId)

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  const valueChangeLabel =
    stats.valueChangePct === null
      ? 'No prior data'
      : `${stats.valueChangePct >= 0 ? '+' : ''}${stats.valueChangePct.toFixed(0)}% vs last month`

  const cards = [
    {
      label: 'Total Unique Items',
      value: String(stats.totalItems),
      hint: `Across ${stats.categoriesCount} categor${stats.categoriesCount === 1 ? 'y' : 'ies'}`,
      tone: 'text-success',
    },
    {
      label: 'Low Stock Alerts',
      value: String(stats.lowStockCount),
      hint: stats.lowStockCount > 0 ? 'Action needed soon' : 'None',
      tone: stats.lowStockCount > 0 ? 'text-warning' : 'text-muted-foreground',
    },
    {
      label: 'Out of Stock',
      value: String(stats.outOfStockCount),
      hint: stats.outOfStockCount > 0 ? 'Critical - Restock now' : 'None',
      tone: stats.outOfStockCount > 0 ? 'text-destructive' : 'text-muted-foreground',
    },
    {
      label: 'Value in Stock',
      value: formatMoney(stats.valueInStock, currency, { compact: true }),
      hint: valueChangeLabel,
      tone:
        stats.valueChangePct === null
          ? 'text-muted-foreground'
          : stats.valueChangePct >= 0
            ? 'text-success'
            : 'text-destructive',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{card.value}</p>
            <p className={`text-sm ${card.tone}`}>{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
