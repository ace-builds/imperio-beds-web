import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormPage, FormPageBackLink, FormPageError, FormSection } from '@/components/form-page'
import { useCreateItem, useInventoryCategories, useUpdateItem } from '@/hooks/use-inventory'
import type { InventoryItem } from '@/lib/schemas/inventory'

export function ItemForm({
  hotelId,
  item,
  defaultCategoryId,
}: {
  hotelId: string
  item?: InventoryItem
  defaultCategoryId?: string
}) {
  const navigate = useNavigate()
  const isEditing = !!item
  const { data: categories } = useInventoryCategories(hotelId)

  const [name, setName] = useState(item?.name ?? '')
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? defaultCategoryId ?? '')
  const [unit, setUnit] = useState(item?.unit ?? '')
  const [minStock, setMinStock] = useState(
    item?.minStockThreshold !== undefined ? String(item.minStockThreshold) : '0',
  )

  const createItem = useCreateItem(hotelId)
  const updateItem = useUpdateItem(hotelId)
  const mutation = isEditing ? updateItem : createItem

  function goBack() {
    void navigate({ to: '/inventory' })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = { categoryId, name, unit, minStockThreshold: Number(minStock) }
    if (isEditing) {
      updateItem.mutate({ itemId: item.id, input }, { onSuccess: goBack })
    } else {
      createItem.mutate(input, { onSuccess: goBack })
    }
  }

  return (
    <FormPage
      title={isEditing ? `Edit ${item.name}` : 'Add Inventory Item'}
      description={
        isEditing
          ? 'Update item details. The stock level itself only changes through Stock In / Stock Out.'
          : 'New items start at zero stock — record the opening quantity with Stock In afterwards.'
      }
      backLink={<FormPageBackLink to="/inventory">Inventory</FormPageBackLink>}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="outline" type="button" onClick={goBack}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending || !name.trim() || !unit.trim() || !categoryId}
          >
            {mutation.isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </>
      }
    >
      <FormSection title="Item Details" description="What this item is and how it's counted.">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="item-name">Name</FieldLabel>
            <Input
              id="item-name"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Hand Soap"
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
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>
              Categories are managed from the Categories panel on the inventory page.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="item-unit">Unit of Measure</FieldLabel>
            <Input
              id="item-unit"
              required
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              placeholder="pcs, litres, kg, rolls…"
              className="sm:w-56"
            />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection
        title="Stock Alerts"
        description="Items below their threshold surface as low stock on the dashboard."
      >
        <Field>
          <FieldLabel htmlFor="item-min">Low Stock Threshold</FieldLabel>
          <Input
            id="item-min"
            type="number"
            min="0"
            step="0.01"
            required
            value={minStock}
            onChange={(event) => setMinStock(event.target.value)}
            className="sm:w-40"
          />
          <FieldDescription>
            {unit.trim()
              ? `Alert once stock falls below this many ${unit.trim()}.`
              : 'Alert once stock falls below this quantity.'}
          </FieldDescription>
        </Field>
      </FormSection>

      <FormPageError error={mutation.error?.message} />
    </FormPage>
  )
}
