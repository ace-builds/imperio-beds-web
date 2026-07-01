import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  getInventoryStats,
  listCategories,
  listItems,
  listLowStock,
  listMovements,
  stockIn,
  stockOut,
  updateCategory,
  updateItem,
} from '@/lib/api/inventory'
import type {
  CreateCategoryInput,
  CreateItemInput,
  StockInInput,
  StockOutInput,
  UpdateItemInput,
} from '@/lib/schemas/inventory'

const categoriesKey = (hotelId: string) => ['hotels', hotelId, 'inventory', 'categories']
const itemsKey = (hotelId: string, categoryId?: string) =>
  categoryId
    ? ['hotels', hotelId, 'inventory', 'items', { categoryId }]
    : ['hotels', hotelId, 'inventory', 'items']
const lowStockKey = (hotelId: string) => ['hotels', hotelId, 'inventory', 'low-stock']
const statsKey = (hotelId: string) => ['hotels', hotelId, 'inventory', 'stats']
const movementsKey = (hotelId: string, itemId: string) => [
  'hotels',
  hotelId,
  'inventory',
  'items',
  itemId,
  'movements',
]

// ── Categories ──────────────────────────────────────────────────────────────

export function useInventoryCategories(hotelId: string) {
  return useQuery({
    queryKey: categoriesKey(hotelId),
    queryFn: () => listCategories(hotelId),
    enabled: !!hotelId,
  })
}

export function useCreateCategory(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(hotelId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: statsKey(hotelId) })
    },
  })
}

export function useUpdateCategory(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, input }: { categoryId: string; input: CreateCategoryInput }) =>
      updateCategory(hotelId, categoryId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: statsKey(hotelId) })
    },
  })
}

export function useDeleteCategory(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(hotelId, categoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: statsKey(hotelId) })
    },
  })
}

// ── Items ────────────────────────────────────────────────────────────────────

export function useInventoryItems(hotelId: string, categoryId?: string) {
  return useQuery({
    queryKey: itemsKey(hotelId, categoryId),
    queryFn: () => listItems(hotelId, categoryId),
    enabled: !!hotelId,
  })
}

export function useLowStockItems(hotelId: string) {
  return useQuery({
    queryKey: lowStockKey(hotelId),
    queryFn: () => listLowStock(hotelId),
    enabled: !!hotelId,
  })
}

export function useCreateItem(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateItemInput) => createItem(hotelId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: lowStockKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: statsKey(hotelId) })
    },
  })
}

export function useUpdateItem(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: UpdateItemInput }) =>
      updateItem(hotelId, itemId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: lowStockKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: statsKey(hotelId) })
    },
  })
}

export function useDeleteItem(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => deleteItem(hotelId, itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: lowStockKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: statsKey(hotelId) })
    },
  })
}

// ── Stats ────────────────────────────────────────────────────────────────────

export function useInventoryStats(hotelId: string) {
  return useQuery({
    queryKey: statsKey(hotelId),
    queryFn: () => getInventoryStats(hotelId),
    enabled: !!hotelId,
  })
}

// ── Movements ────────────────────────────────────────────────────────────────

export function useInventoryMovements(hotelId: string, itemId: string) {
  return useQuery({
    queryKey: movementsKey(hotelId, itemId),
    queryFn: () => listMovements(hotelId, itemId),
    enabled: !!hotelId && !!itemId,
  })
}

export function useStockIn(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: StockInInput }) =>
      stockIn(hotelId, itemId, input),
    onSuccess: (_data, { itemId }) => {
      void queryClient.invalidateQueries({ queryKey: itemsKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: lowStockKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: statsKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: movementsKey(hotelId, itemId) })
    },
  })
}

export function useStockOut(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: StockOutInput }) =>
      stockOut(hotelId, itemId, input),
    onSuccess: (_data, { itemId }) => {
      void queryClient.invalidateQueries({ queryKey: itemsKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: lowStockKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: statsKey(hotelId) })
      void queryClient.invalidateQueries({ queryKey: movementsKey(hotelId, itemId) })
    },
  })
}
