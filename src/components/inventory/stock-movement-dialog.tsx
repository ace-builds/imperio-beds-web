import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useStockIn, useStockOut } from '@/hooks/use-inventory'
import type { InventoryItem, InventoryMovementType } from '@/lib/schemas/inventory'

export function StockMovementDialog({
  open,
  onOpenChange,
  hotelId,
  item,
  type,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  item: InventoryItem
  type: InventoryMovementType
}) {
  const isIn = type === 'in'
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [cost, setCost] = useState('')

  useEffect(() => {
    if (!open) return
    setQuantity('')
    setReason('')
    setCost('')
  }, [open])

  const stockInMutation = useStockIn(hotelId)
  const stockOutMutation = useStockOut(hotelId)
  const mutation = isIn ? stockInMutation : stockOutMutation

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const qty = Number(quantity)
    if (isIn) {
      stockInMutation.mutate(
        {
          itemId: item.id,
          input: {
            quantity: qty,
            reason,
            ...(cost ? { cost: Number(cost) } : {}),
          },
        },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      stockOutMutation.mutate(
        { itemId: item.id, input: { quantity: qty, reason } },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isIn ? 'Stock In' : 'Stock Out'} — {item.name}</DialogTitle>
          <DialogDescription>
            Current stock: <strong>{item.currentStock} {item.unit}</strong>
            {!isIn && ` · Maximum you can remove: ${item.currentStock} ${item.unit}`}
          </DialogDescription>
        </DialogHeader>
        <form id="movement-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="movement-qty">
                Quantity ({item.unit})
              </FieldLabel>
              <Input
                id="movement-qty"
                type="number"
                min="0.01"
                step="0.01"
                max={!isIn ? item.currentStock : undefined}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="movement-reason">Reason</FieldLabel>
              <Textarea
                id="movement-reason"
                required
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isIn ? 'e.g. Weekly restock from supplier' : 'e.g. Room 205 usage'
                }
              />
            </Field>
            {isIn && (
              <Field>
                <FieldLabel htmlFor="movement-cost">
                  Cost{' '}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  id="movement-cost"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                />
              </Field>
            )}
          </FieldGroup>
        </form>
        {mutation.isError && (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="movement-form"
            disabled={mutation.isPending || !quantity || !reason}
            variant={isIn ? 'default' : 'destructive'}
          >
            {mutation.isPending
              ? 'Saving…'
              : isIn
                ? 'Confirm Stock In'
                : 'Confirm Stock Out'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
