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
import { useSetStaffSalary } from '@/hooks/use-payroll'
import type { PayrollRow } from '@/lib/schemas/payroll'

export function SetSalaryDialog({
  open,
  onOpenChange,
  hotelId,
  period,
  row,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  period: string
  row?: PayrollRow
}) {
  const [baseSalary, setBaseSalary] = useState('')
  const setSalary = useSetStaffSalary(hotelId, period)

  useEffect(() => {
    if (!open) return
    setBaseSalary(row?.baseSalary ? String(row.baseSalary) : '')
  }, [open, row])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!row || !baseSalary) return
    setSalary.mutate(
      { staffId: row.staffId, input: { baseSalary: Number(baseSalary) } },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{row?.baseSalary ? 'Update Salary' : 'Set Salary'}</DialogTitle>
          <DialogDescription>
            {row ? `Monthly base salary for ${row.name}.` : ''}
          </DialogDescription>
        </DialogHeader>
        <form id="set-salary-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="base-salary">
                Base Salary <span className="font-normal text-muted-foreground">(Monthly)</span>
              </FieldLabel>
              <Input
                id="base-salary"
                type="number"
                min="0"
                step="0.01"
                required
                value={baseSalary}
                onChange={(event) => setBaseSalary(event.target.value)}
                placeholder="120000"
              />
            </Field>
          </FieldGroup>
        </form>
        {setSalary.isError && <p className="text-sm text-destructive">{setSalary.error.message}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="set-salary-form" disabled={setSalary.isPending || !baseSalary}>
            {setSalary.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
