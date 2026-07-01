import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCheckOut, useStay } from '@/hooks/use-stays'
import { useActiveHotel } from '@/hooks/use-hotels'
import { formatMoney } from '@/lib/format'

export function StayDetailSheet({
  open,
  onOpenChange,
  hotelId,
  stayId,
  onExtend,
  onMove,
  onPayment,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  stayId: string | undefined
  onExtend: () => void
  onMove: () => void
  onPayment: () => void
}) {
  const { data: stay, isLoading } = useStay(hotelId, stayId)
  const { hotel } = useActiveHotel()
  const checkOut = useCheckOut(hotelId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{stay ? `Room ${stay.room.number} — ${stay.guest.name}` : 'Stay'}</SheetTitle>
          <SheetDescription>
            {stay && `Checked in ${new Date(stay.checkInAt).toLocaleDateString()}`}
          </SheetDescription>
        </SheetHeader>

        {isLoading && <p className="px-4 text-sm text-muted-foreground">Loading…</p>}

        {stay && (
          <div className="flex flex-col gap-4 px-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Nights</p>
                <p className="font-medium">{stay.nights}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Due</p>
                <p className="font-medium">{formatMoney(stay.totalDue, hotel?.currency)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Paid</p>
                <p className="font-medium">{formatMoney(stay.totalPaid, hotel?.currency)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Balance</p>
                <p className={`font-medium ${stay.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                  {formatMoney(stay.balance, hotel?.currency)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={onExtend}>
                Extend Stay
              </Button>
              <Button variant="outline" size="sm" onClick={onMove}>
                Move Room
              </Button>
              <Button variant="outline" size="sm" onClick={onPayment}>
                Record Payment
              </Button>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Payments</p>
              {stay.payments.length === 0 && (
                <p className="text-sm text-muted-foreground">No payments recorded.</p>
              )}
              <div className="flex flex-col gap-1.5">
                {stay.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {payment.method.toUpperCase()} — {new Date(payment.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-medium">{formatMoney(payment.amount, hotel?.currency)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Notes</p>
              {stay.notes.length === 0 && (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              )}
              <div className="flex flex-col gap-2">
                {stay.notes.map((note) => (
                  <p key={note.id} className="text-sm text-muted-foreground">
                    {note.body}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        <SheetFooter>
          {stay && (
            <Button
              disabled={checkOut.isPending}
              onClick={() => checkOut.mutate(stay.id, { onSuccess: () => onOpenChange(false) })}
            >
              {checkOut.isPending ? 'Checking out…' : 'Check Out'}
            </Button>
          )}
          {checkOut.isError && (
            <p className="text-sm text-destructive">{checkOut.error.message}</p>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
