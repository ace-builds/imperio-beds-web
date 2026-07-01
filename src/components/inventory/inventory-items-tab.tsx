import { useState } from 'react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDeleteItem, useInventoryCategories, useInventoryItems } from '@/hooks/use-inventory'
import type { InventoryItem, InventoryMovementType } from '@/lib/schemas/inventory'
import { ItemFormDialog } from './item-form-dialog'
import { MovementHistorySheet } from './movement-history-sheet'
import { StockMovementDialog } from './stock-movement-dialog'

export function InventoryItemsTab({
  hotelId,
  canManage,
  canStock,
}: {
  hotelId: string
  canManage: boolean
  canStock: boolean
}) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [itemDialog, setItemDialog] = useState<{
    open: boolean
    item?: InventoryItem
  }>({ open: false })
  const [movementDialog, setMovementDialog] = useState<{
    open: boolean
    item?: InventoryItem
    type: InventoryMovementType
  }>({ open: false, type: 'in' })
  const [historySheet, setHistorySheet] = useState<{
    open: boolean
    item: InventoryItem | null
  }>({ open: false, item: null })
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    item?: InventoryItem
  }>({ open: false })

  const { data: categories } = useInventoryCategories(hotelId)
  const { data: items, isLoading } = useInventoryItems(
    hotelId,
    categoryFilter !== 'all' ? categoryFilter : undefined,
  )
  const deleteItem = useDeleteItem(hotelId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {canManage && (
          <Button size="sm" onClick={() => setItemDialog({ open: true })}>
            <Plus className="size-4" />
            Add Item
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : items?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No items yet</EmptyTitle>
            <EmptyDescription>
              {canManage
                ? 'Add your first inventory item to start tracking stock.'
                : 'No items have been added to this category yet.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((item) => {
                const isLow = item.currentStock < item.minStockThreshold
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.category?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.currentStock} {item.unit}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {item.minStockThreshold} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {isLow ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="secondary">OK</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canStock && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  setMovementDialog({ open: true, item, type: 'in' })
                                }
                              >
                                <ArrowUpCircle className="size-4 text-green-600" />
                                Stock In
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setMovementDialog({ open: true, item, type: 'out' })
                                }
                              >
                                <ArrowDownCircle className="size-4 text-destructive" />
                                Stock Out
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => setHistorySheet({ open: true, item })}
                          >
                            <History className="size-4" />
                            Movement History
                          </DropdownMenuItem>
                          {canManage && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setItemDialog({ open: true, item })}
                              >
                                <Pencil className="size-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteConfirm({ open: true, item })}
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ItemFormDialog
        open={itemDialog.open}
        onOpenChange={(open) => setItemDialog((s) => ({ ...s, open }))}
        hotelId={hotelId}
        item={itemDialog.item}
        defaultCategoryId={categoryFilter !== 'all' ? categoryFilter : undefined}
      />

      {movementDialog.item && (
        <StockMovementDialog
          open={movementDialog.open}
          onOpenChange={(open) => setMovementDialog((s) => ({ ...s, open }))}
          hotelId={hotelId}
          item={movementDialog.item}
          type={movementDialog.type}
        />
      )}

      <MovementHistorySheet
        open={historySheet.open}
        onOpenChange={(open) => setHistorySheet((s) => ({ ...s, open }))}
        hotelId={hotelId}
        item={historySheet.item}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm((s) => ({ ...s, open }))}
        title="Delete Item"
        description={`Delete "${deleteConfirm.item?.name}"? This cannot be undone. Items with movement history cannot be deleted.`}
        confirmLabel="Delete"
        destructive
        pending={deleteItem.isPending}
        error={deleteItem.isError ? deleteItem.error.message : null}
        onConfirm={() => {
          if (deleteConfirm.item) {
            deleteItem.mutate(deleteConfirm.item.id, {
              onSuccess: () => setDeleteConfirm({ open: false }),
            })
          }
        }}
      />
    </div>
  )
}
