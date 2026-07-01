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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateItem, useInventoryCategories, useUpdateItem } from '@/hooks/use-inventory'
import type { InventoryItem } from '@/lib/schemas/inventory'

export function ItemFormDialog({
  open,
  onOpenChange,
  hotelId,
  item,
  defaultCategoryId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  item?: InventoryItem
  defaultCategoryId?: string
}) {
  const isEditing = !!item
  const { data: categories } = useInventoryCategories(hotelId)

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [unit, setUnit] = useState('')
  const [minStock, setMinStock] = useState('')

  useEffect(() => {
    if (!open) return
    setName(item?.name ?? '')
    setCategoryId(item?.categoryId ?? defaultCategoryId ?? '')
    setUnit(item?.unit ?? '')
    setMinStock(item?.minStockThreshold !== undefined ? String(item.minStockThreshold) : '0')
  }, [open, item, defaultCategoryId])

  const createItem = useCreateItem(hotelId)
  const updateItem = useUpdateItem(hotelId)
  const mutation = isEditing ? updateItem : createItem

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isEditing) {
      updateItem.mutate(
        {
          itemId: item.id,
          input: {
            categoryId,
            name,
            unit,
            minStockThreshold: Number(minStock),
          },
        },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createItem.mutate(
        {
          categoryId,
          name,
          unit,
          minStockThreshold: Number(minStock),
        },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Item' : 'Add Item'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update item details. Stock level is adjusted via Stock In / Stock Out.'
              : 'New items start with zero stock — use Stock In to add initial stock.'}
          </DialogDescription>
        </DialogHeader>
        <form id="item-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="item-name">Name</FieldLabel>
              <Input
                id="item-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hand Soap"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="item-category">Category</FieldLabel>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger id="item-category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="item-unit">Unit of Measure</FieldLabel>
              <Input
                id="item-unit"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. pcs, litres, kg, rolls"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="item-min">
                Low Stock Threshold{' '}
                <span className="font-normal text-muted-foreground">
                  (alert when stock falls below this)
                </span>
              </FieldLabel>
              <Input
                id="item-min"
                type="number"
                min="0"
                step="0.01"
                required
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
              />
            </Field>
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
            form="item-form"
            disabled={mutation.isPending || !categoryId}
          >
            {mutation.isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
