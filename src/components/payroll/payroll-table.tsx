import { useState } from 'react'
import { FileText, Pencil } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ROLE_INFO, type InvitableRole } from '@/components/onboarding/constants'
import { PaymentStatusBadge } from '@/components/payroll/payroll-badges'
import { PayrollEntryDialog } from '@/components/payroll/payroll-entry-dialog'
import { SetSalaryDialog } from '@/components/payroll/set-salary-dialog'
import { usePayPayrollEntry } from '@/hooks/use-payroll'
import { formatMoney } from '@/lib/format'
import type { Currency } from '@/lib/schemas/hotel'
import type { PayrollRow } from '@/lib/schemas/payroll'

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function PayrollTable({
  hotelId,
  period,
  rows,
  isLoading,
  currency,
  canManage,
}: {
  hotelId: string
  period: string
  rows: PayrollRow[]
  isLoading: boolean
  currency: Currency | null | undefined
  canManage: boolean
}) {
  const payEntry = usePayPayrollEntry(hotelId, period)
  const [salaryTarget, setSalaryTarget] = useState<PayrollRow | undefined>()
  const [entryTarget, setEntryTarget] = useState<PayrollRow | undefined>()

  return (
    <Card className="gap-0">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="font-heading text-base font-medium">Staff Payroll</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Member</TableHead>
            <TableHead>Base Salary</TableHead>
            <TableHead>Adjustments</TableHead>
            <TableHead>Net Payable</TableHead>
            <TableHead>Payment Status</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          )}

          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No staff yet — add staff members from the Staff page first.
              </TableCell>
            </TableRow>
          )}

          {rows.map((row) => {
            const roleInfo = ROLE_INFO[row.role as InvitableRole]
            const entry = row.entry

            return (
              <TableRow key={row.staffId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={row.image ?? undefined} alt={row.name} />
                      <AvatarFallback>{initials(row.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{row.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {roleInfo?.label ?? row.role}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {row.baseSalary === null ? (
                    canManage ? (
                      <Button variant="outline" size="sm" onClick={() => setSalaryTarget(row)}>
                        Set Salary
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-medium tabular-nums">
                        {formatMoney(row.baseSalary, currency)}
                      </span>
                      <span className="text-xs text-muted-foreground">Monthly</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {entry && (entry.additions > 0 || entry.deductions > 0) ? (
                    <div className="flex flex-col gap-0.5 text-xs">
                      {entry.additions > 0 && (
                        <span className="text-success">
                          + {formatMoney(entry.additions, currency)}
                          {entry.additionsNote ? ` · ${entry.additionsNote}` : ''}
                        </span>
                      )}
                      {entry.deductions > 0 && (
                        <span className="text-destructive">
                          - {formatMoney(entry.deductions, currency)}
                          {entry.deductionsNote ? ` · ${entry.deductionsNote}` : ''}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  )}
                </TableCell>
                <TableCell className="font-medium tabular-nums">
                  {entry ? formatMoney(entry.netPayable, currency) : '–'}
                </TableCell>
                <TableCell>
                  {entry ? (
                    <PaymentStatusBadge status={entry.status} />
                  ) : row.baseSalary !== null ? (
                    <Badge variant="secondary">Not Run</Badge>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    {entry ? (
                      <div className="flex items-center justify-end gap-1">
                        {entry.status !== 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={payEntry.isPending}
                            onClick={() => payEntry.mutate(entry.id)}
                          >
                            Pay
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="View payslip"
                          onClick={() => setEntryTarget(row)}
                        >
                          <FileText />
                        </Button>
                      </div>
                    ) : row.baseSalary !== null ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit salary"
                        onClick={() => setSalaryTarget(row)}
                      >
                        <Pencil />
                      </Button>
                    ) : null}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <SetSalaryDialog
        open={!!salaryTarget}
        onOpenChange={(open) => !open && setSalaryTarget(undefined)}
        hotelId={hotelId}
        period={period}
        row={salaryTarget}
      />

      <PayrollEntryDialog
        open={!!entryTarget}
        onOpenChange={(open) => !open && setEntryTarget(undefined)}
        hotelId={hotelId}
        period={period}
        row={entryTarget}
        currency={currency}
      />
    </Card>
  )
}
