import { z } from 'zod'

// Duplicated from the server's src/schemas/inventory.schema.ts —
// no shared package across repos, kept in sync by hand per project convention.

export const inventoryCategorySchema = z.object({
  id: z.string(),
  hotelId: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  _count: z.object({ items: z.number() }).optional(),
})
export type InventoryCategory = z.infer<typeof inventoryCategorySchema>

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
})
export type CreateCategoryInput = z.infer<typeof createCategorySchema>

export const INVENTORY_MOVEMENT_TYPES = ['in', 'out'] as const
export const inventoryMovementTypeSchema = z.enum(INVENTORY_MOVEMENT_TYPES)
export type InventoryMovementType = z.infer<typeof inventoryMovementTypeSchema>

export const inventoryItemSchema = z.object({
  id: z.string(),
  hotelId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  unit: z.string(),
  currentStock: z.number(),
  minStockThreshold: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  category: z.object({ id: z.string(), name: z.string() }).optional(),
})
export type InventoryItem = z.infer<typeof inventoryItemSchema>

export const createItemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required'),
  unit: z.string().min(1, 'Unit is required'),
  minStockThreshold: z.number().min(0).default(0),
})
export type CreateItemInput = z.infer<typeof createItemSchema>

export const updateItemSchema = z.object({
  categoryId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  minStockThreshold: z.number().min(0).optional(),
})
export type UpdateItemInput = z.infer<typeof updateItemSchema>

export const inventoryMovementSchema = z.object({
  id: z.string(),
  hotelId: z.string(),
  itemId: z.string(),
  type: inventoryMovementTypeSchema,
  quantity: z.number().positive(),
  reason: z.string(),
  cost: z.number().positive().nullable(),
  staffUserId: z.string().nullable(),
  createdAt: z.coerce.date(),
})
export type InventoryMovement = z.infer<typeof inventoryMovementSchema>

export const stockInSchema = z.object({
  quantity: z.number().positive('Quantity must be positive'),
  reason: z.string().min(1, 'Reason is required'),
  cost: z.number().positive().optional(),
})
export type StockInInput = z.infer<typeof stockInSchema>

export const stockOutSchema = z.object({
  quantity: z.number().positive('Quantity must be positive'),
  reason: z.string().min(1, 'Reason is required'),
})
export type StockOutInput = z.infer<typeof stockOutSchema>
