import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'
import type { Currency } from '@/lib/schemas/hotel'
import type { PayrollRow } from '@/lib/schemas/payroll'

export function PayrollStats({ rows, currency }: { rows: PayrollRow[]; currency: Currency | null | undefined }) {
  const entries = rows.map((row) => row.entry).filter((entry) => entry !== null)
  const totalPayroll = entries.reduce((sum, entry) => sum + entry.netPayable, 0)
  const pending = entries.filter((entry) => entry.status !== 'paid')
  const paid = entries.filter((entry) => entry.status === 'paid')
  const totalDeductions = entries.reduce((sum, entry) => sum + entry.deductions, 0)

  const stats = [
    {
      label: 'Total Payroll',
      value: formatMoney(totalPayroll, currency),
      hint: 'Including allowances',
      tone: 'text-muted-foreground',
    },
    {
      label: 'Pending Payout',
      value: formatMoney(pending.reduce((sum, entry) => sum + entry.netPayable, 0), currency),
      hint: `${pending.length} Staff Pending`,
      tone: pending.length > 0 ? 'text-warning' : 'text-muted-foreground',
    },
    {
      label: 'Paid',
      value: formatMoney(paid.reduce((sum, entry) => sum + entry.netPayable, 0), currency),
      hint: `${paid.length} Staff Paid`,
      tone: 'text-success',
    },
    {
      label: 'Deductions',
      value: formatMoney(totalDeductions, currency),
      hint: 'Lateness & Advances',
      tone: 'text-muted-foreground',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className={`text-sm ${stat.tone}`}>{stat.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
