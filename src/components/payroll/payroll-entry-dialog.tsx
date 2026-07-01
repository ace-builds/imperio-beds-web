import { useEffect, useState, type FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useUpdatePayrollEntry } from '@/hooks/use-payroll'
import { formatMoney } from '@/lib/format'
import type { Currency } from '@/lib/schemas/hotel'
import { PAYROLL_ENTRY_STATUSES, type PayrollEntryStatus, type PayrollRow } from '@/lib/schemas/payroll'

const STATUS_LABEL: Record<PayrollEntryStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  paid: 'Paid',
}

export function PayrollEntryDialog({
  open,
  onOpenChange,
  hotelId,
  period,
  row,
  currency,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  period: string
  row?: PayrollRow
  currency: Currency | null | undefined
}) {
  const entry = row?.entry
  const [additions, setAdditions] = useState('')
  const [additionsNote, setAdditionsNote] = useState('')
  const [deductions, setDeductions] = useState('')
  const [deductionsNote, setDeductionsNote] = useState('')
  const [status, setStatus] = useState<PayrollEntryStatus>('pending')

  const updateEntry = useUpdatePayrollEntry(hotelId, period)

  useEffect(() => {
    if (!open || !entry) return
    setAdditions(entry.additions ? String(entry.additions) : '')
    setAdditionsNote(entry.additionsNote ?? '')
    setDeductions(entry.deductions ? String(entry.deductions) : '')
    setDeductionsNote(entry.deductionsNote ?? '')
    setStatus(entry.status)
  }, [open, entry])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!entry) return
    updateEntry.mutate(
      {
        entryId: entry.id,
        input: {
          additions: additions ? Number(additions) : 0,
          additionsNote: additionsNote.trim() ? additionsNote.trim() : null,
          deductions: deductions ? Number(deductions) : 0,
          deductionsNote: deductionsNote.trim() ? deductionsNote.trim() : null,
          status,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  if (!row || !entry) return null

  const netPayable =
    Number(entry.baseSalary) + (additions ? Number(additions) : 0) - (deductions ? Number(deductions) : 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payslip — {row.name}</DialogTitle>
          <DialogDescription>
            {period} · Base salary {formatMoney(entry.baseSalary, currency)}
          </DialogDescription>
        </DialogHeader>
        <form id="payroll-entry-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="entry-additions">Additions</FieldLabel>
                <Input
                  id="entry-additions"
                  type="number"
                  min="0"
                  step="0.01"
                  value={additions}
                  onChange={(event) => setAdditions(event.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="entry-additions-note">Reason</FieldLabel>
                <Input
                  id="entry-additions-note"
                  value={additionsNote}
                  onChange={(event) => setAdditionsNote(event.target.value)}
                  placeholder="Overtime"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="entry-deductions">Deductions</FieldLabel>
                <Input
                  id="entry-deductions"
                  type="number"
                  min="0"
                  step="0.01"
                  value={deductions}
                  onChange={(event) => setDeductions(event.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="entry-deductions-note">Reason</FieldLabel>
                <Input
                  id="entry-deductions-note"
                  value={deductionsNote}
                  onChange={(event) => setDeductionsNote(event.target.value)}
                  placeholder="Lateness"
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="entry-status">Payment Status</FieldLabel>
              <Select value={status} onValueChange={(value) => setStatus(value as PayrollEntryStatus)}>
                <SelectTrigger id="entry-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PAYROLL_ENTRY_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {STATUS_LABEL[option]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </form>
        <Separator />
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Net Payable</span>
          <span className="text-base font-semibold">{formatMoney(netPayable, currency)}</span>
        </div>
        {updateEntry.isError && (
          <p className="text-sm text-destructive">{updateEntry.error.message}</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="payroll-entry-form" disabled={updateEntry.isPending}>
            {updateEntry.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
