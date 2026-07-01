import { AlertTriangle, ArrowUpCircle } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLowStockItems } from '@/hooks/use-inventory'
import type { InventoryItem } from '@/lib/schemas/inventory'
import { StockMovementDialog } from './stock-movement-dialog'

export function LowStockTab({
  hotelId,
  canStock,
}: {
  hotelId: string
  canStock: boolean
}) {
  const { data: items, isLoading } = useLowStockItems(hotelId)
  const [movementDialog, setMovementDialog] = useState<{
    open: boolean
    item?: InventoryItem
  }>({ open: false })

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : items?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>All stock levels are OK</EmptyTitle>
            <EmptyDescription>
              No items are currently below their minimum threshold.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            {items.length} item{items.length !== 1 ? 's' : ''} below minimum stock threshold
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Minimum</TableHead>
                  {canStock && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.category?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <Badge variant="destructive">
                        {item.currentStock} {item.unit}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {item.minStockThreshold} {item.unit}
                    </TableCell>
                    {canStock && (
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setMovementDialog({ open: true, item })}
                        >
                          <ArrowUpCircle className="size-4 text-green-600" />
                          Restock
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {movementDialog.item && (
        <StockMovementDialog
          open={movementDialog.open}
          onOpenChange={(open) => setMovementDialog((s) => ({ ...s, open }))}
          hotelId={hotelId}
          item={movementDialog.item}
          type="in"
        />
      )}
    </div>
  )
}
