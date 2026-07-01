import { useEffect, useState } from 'react'
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
import { useAddPayment, useStay } from '@/hooks/use-stays'
import { PAYMENT_METHODS, type PaymentMethod } from '@/lib/schemas/stay'

export function PaymentDialog({
  open,
  onOpenChange,
  hotelId,
  stayId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  stayId: string | null
}) {
  const { data: stay } = useStay(hotelId, stayId ?? undefined)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const addPayment = useAddPayment(hotelId)

  useEffect(() => {
    if (open) {
      setAmount('')
      setMethod('cash')
      addPayment.reset()
    }
  }, [open])

  if (!stay) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Room {stay.room.number} — {stay.guest.name}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="payment-amount">Amount</FieldLabel>
            <Input
              id="payment-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              autoFocus
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="payment-method">Method</FieldLabel>
            <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
              <SelectTrigger id="payment-method" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PAYMENT_METHODS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        {addPayment.isError && (
          <p className="text-sm text-destructive">{addPayment.error.message}</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!amount || addPayment.isPending}
            onClick={() =>
              addPayment.mutate(
                { stayId: stay.id, input: { amount: Number(amount), method } },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            {addPayment.isPending ? 'Recording…' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
