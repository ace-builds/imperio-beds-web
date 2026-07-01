import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useCreateCategory, useUpdateCategory } from '@/hooks/use-inventory'
import type { InventoryCategory } from '@/lib/schemas/inventory'

export function CategoryFormDialog({
  open,
  onOpenChange,
  hotelId,
  category,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  category?: InventoryCategory
}) {
  const isEditing = !!category
  const [name, setName] = useState('')

  useEffect(() => {
    if (!open) return
    setName(category?.name ?? '')
  }, [open, category])

  const createCategory = useCreateCategory(hotelId)
  const updateCategory = useUpdateCategory(hotelId)
  const mutation = isEditing ? updateCategory : createCategory

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isEditing) {
      updateCategory.mutate(
        { categoryId: category.id, input: { name } },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createCategory.mutate({ name }, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        <form id="category-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="category-name">Name</FieldLabel>
              <Input
                id="category-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Toiletries, Cleaning Supplies"
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
          <Button type="submit" form="category-form" disabled={mutation.isPending || !name}>
            {mutation.isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
