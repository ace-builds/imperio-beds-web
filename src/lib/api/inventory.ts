import { apiFetch } from './client'
import type {
  CreateCategoryInput,
  CreateItemInput,
  InventoryCategory,
  InventoryItem,
  InventoryMovement,
  StockInInput,
  StockOutInput,
  UpdateItemInput,
} from '@/lib/schemas/inventory'

// ── Categories ──────────────────────────────────────────────────────────────

export function listCategories(hotelId: string) {
  return apiFetch<InventoryCategory[]>(`/hotels/${hotelId}/inventory/categories`, { hotelId })
}

export function createCategory(hotelId: string, input: CreateCategoryInput) {
  return apiFetch<InventoryCategory>(`/hotels/${hotelId}/inventory/categories`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function updateCategory(hotelId: string, categoryId: string, input: CreateCategoryInput) {
  return apiFetch<InventoryCategory>(
    `/hotels/${hotelId}/inventory/categories/${categoryId}`,
    { method: 'PATCH', body: JSON.stringify(input), hotelId },
  )
}

export function deleteCategory(hotelId: string, categoryId: string) {
  return apiFetch<void>(`/hotels/${hotelId}/inventory/categories/${categoryId}`, {
    method: 'DELETE',
    hotelId,
  })
}

// ── Items ────────────────────────────────────────────────────────────────────

export function listItems(hotelId: string, categoryId?: string) {
  const qs = categoryId ? `?categoryId=${categoryId}` : ''
  return apiFetch<InventoryItem[]>(`/hotels/${hotelId}/inventory/items${qs}`, { hotelId })
}

export function listLowStock(hotelId: string) {
  return apiFetch<InventoryItem[]>(`/hotels/${hotelId}/inventory/items/low-stock`, { hotelId })
}

export function createItem(hotelId: string, input: CreateItemInput) {
  return apiFetch<InventoryItem>(`/hotels/${hotelId}/inventory/items`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function updateItem(hotelId: string, itemId: string, input: UpdateItemInput) {
  return apiFetch<InventoryItem>(`/hotels/${hotelId}/inventory/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function deleteItem(hotelId: string, itemId: string) {
  return apiFetch<void>(`/hotels/${hotelId}/inventory/items/${itemId}`, {
    method: 'DELETE',
    hotelId,
  })
}

// ── Movements ────────────────────────────────────────────────────────────────

export function listMovements(hotelId: string, itemId: string) {
  return apiFetch<InventoryMovement[]>(
    `/hotels/${hotelId}/inventory/items/${itemId}/movements`,
    { hotelId },
  )
}

export function stockIn(hotelId: string, itemId: string, input: StockInInput) {
  return apiFetch<InventoryItem>(`/hotels/${hotelId}/inventory/items/${itemId}/stock-in`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}

export function stockOut(hotelId: string, itemId: string, input: StockOutInput) {
  return apiFetch<InventoryItem>(`/hotels/${hotelId}/inventory/items/${itemId}/stock-out`, {
    method: 'POST',
    body: JSON.stringify(input),
    hotelId,
  })
}
