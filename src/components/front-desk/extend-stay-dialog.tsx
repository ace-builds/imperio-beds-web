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
import { DatePicker } from '@/components/date-picker'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { useExtendStay, useStay } from '@/hooks/use-stays'

export function ExtendStayDialog({
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
  const [checkOutDate, setCheckOutDate] = useState(new Date())
  const extendStay = useExtendStay(hotelId)

  useEffect(() => {
    if (open && stay) {
      setCheckOutDate(new Date(stay.expectedCheckOutAt))
      extendStay.reset()
    }
  }, [open, stay])

  if (!stay) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Stay</DialogTitle>
          <DialogDescription>
            Room {stay.room.number} — {stay.guest.name}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>New Expected Checkout</FieldLabel>
            <DatePicker date={checkOutDate} onDateChange={setCheckOutDate} />
          </Field>
        </FieldGroup>
        {extendStay.isError && (
          <p className="text-sm text-destructive">{extendStay.error.message}</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={extendStay.isPending}
            onClick={() =>
              extendStay.mutate(
                { stayId: stay.id, input: { expectedCheckOutAt: checkOutDate } },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            {extendStay.isPending ? 'Saving…' : 'Extend Stay'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
