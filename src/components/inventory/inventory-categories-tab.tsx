import { useState } from 'react'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDeleteCategory, useInventoryCategories } from '@/hooks/use-inventory'
import type { InventoryCategory } from '@/lib/schemas/inventory'
import { CategoryFormDialog } from './category-form-dialog'

export function InventoryCategoriesTab({
  hotelId,
  canManage,
}: {
  hotelId: string
  canManage: boolean
}) {
  const [formDialog, setFormDialog] = useState<{
    open: boolean
    category?: InventoryCategory
  }>({ open: false })
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    category?: InventoryCategory
  }>({ open: false })

  const { data: categories, isLoading } = useInventoryCategories(hotelId)
  const deleteCategory = useDeleteCategory(hotelId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        {canManage && (
          <Button size="sm" onClick={() => setFormDialog({ open: true })}>
            <Plus className="size-4" />
            Add Category
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : categories?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No categories yet</EmptyTitle>
            <EmptyDescription>
              {canManage
                ? 'Create a category like "Toiletries" or "Cleaning Supplies" to organise your inventory.'
                : 'No categories have been created yet.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Items</TableHead>
                {canManage && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {cat._count?.items ?? 0} item{cat._count?.items !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setFormDialog({ open: true, category: cat })}
                          >
                            <Pencil className="size-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteConfirm({ open: true, category: cat })}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CategoryFormDialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((s) => ({ ...s, open }))}
        hotelId={hotelId}
        category={formDialog.category}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm((s) => ({ ...s, open }))}
        title="Delete Category"
        description={`Delete "${deleteConfirm.category?.name}"? This will fail if the category still has items.`}
        confirmLabel="Delete"
        destructive
        pending={deleteCategory.isPending}
        error={deleteCategory.isError ? deleteCategory.error.message : null}
        onConfirm={() => {
          if (deleteConfirm.category) {
            deleteCategory.mutate(deleteConfirm.category.id, {
              onSuccess: () => setDeleteConfirm({ open: false }),
            })
          }
        }}
      />
    </div>
  )
}
