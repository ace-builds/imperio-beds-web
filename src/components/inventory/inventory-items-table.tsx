import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  Download,
  FolderCog,
  History,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteItem,
  useInventoryCategories,
  useInventoryItems,
} from "@/hooks/use-inventory";
import { downloadCsv } from "@/lib/csv";
import type {
  InventoryItem,
  InventoryMovementType,
} from "@/lib/schemas/inventory";
import { InventoryCategoriesTab } from "./inventory-categories-tab";
import { ItemFormDialog } from "./item-form-dialog";
import { MovementHistorySheet } from "./movement-history-sheet";
import { StockMovementDialog } from "./stock-movement-dialog";

type ItemStatus = "in-stock" | "low-stock" | "out-of-stock";

function getStatus(item: InventoryItem): ItemStatus {
  if (item.currentStock <= 0) return "out-of-stock";
  if (item.currentStock < item.minStockThreshold) return "low-stock";
  return "in-stock";
}

const STATUS_BADGE: Record<
  ItemStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  "in-stock": { label: "In Stock", variant: "success" },
  "low-stock": { label: "Low Stock", variant: "warning" },
  "out-of-stock": { label: "Out of Stock", variant: "destructive" },
};

const STOCK_LEVEL_CLASS: Record<ItemStatus, string> = {
  "in-stock": "text-foreground",
  "low-stock": "text-warning",
  "out-of-stock": "text-destructive",
};

function formatLastUpdated(date: Date | string) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (typeof date === "string") date = new Date(date);
  if (date.toDateString() === now.toDateString())
    return `Today, ${format(date, "h:mm a")}`;
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return format(date, "MMM d, yyyy");
}

export function InventoryItemsTable({
  hotelId,
  canManage,
  canStock,
}: {
  hotelId: string;
  canManage: boolean;
  canStock: boolean;
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categoriesSheetOpen, setCategoriesSheetOpen] = useState(false);
  const [itemDialog, setItemDialog] = useState<{
    open: boolean;
    item?: InventoryItem;
  }>({ open: false });
  const [movementDialog, setMovementDialog] = useState<{
    open: boolean;
    item?: InventoryItem;
    type: InventoryMovementType;
  }>({ open: false, type: "in" });
  const [historySheet, setHistorySheet] = useState<{
    open: boolean;
    item: InventoryItem | null;
  }>({ open: false, item: null });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    item?: InventoryItem;
  }>({ open: false });

  const { data: categories } = useInventoryCategories(hotelId);
  const { data: items, isLoading } = useInventoryItems(
    hotelId,
    categoryFilter !== "all" ? categoryFilter : undefined,
  );
  const deleteItem = useDeleteItem(hotelId);

  const visibleItems = (items ?? []).filter((item) =>
    item.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  function exportAuditSheet() {
    const header = [
      "Item Name",
      "Category",
      "Unit",
      "Current Stock",
      "Min Threshold",
      "Status",
      "Last Updated",
      "Counted Qty",
      "Variance",
    ];
    const body = visibleItems.map((item) => [
      item.name,
      item.category?.name ?? "",
      item.unit,
      item.currentStock,
      item.minStockThreshold,
      STATUS_BADGE[getStatus(item)].label,
      item.updatedAt.toISOString(),
      "",
      "",
    ]);
    downloadCsv(`inventory-audit-${format(new Date(), "yyyy-MM-dd")}.csv`, [
      header,
      ...body,
    ]);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search inventory…"
              className="w-64 pl-8"
            />
          </div>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCategoriesSheetOpen(true)}
            >
              <FolderCog data-icon="inline-start" />
              Categories
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportAuditSheet}
            disabled={visibleItems.length === 0}
          >
            <Download data-icon="inline-start" />
            Audit Sheet
          </Button>
          {canManage && (
            <Button onClick={() => setItemDialog({ open: true })}>
              <Plus data-icon="inline-start" />
              Add New Item
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : visibleItems.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No items found</EmptyTitle>
            <EmptyDescription>
              {items?.length
                ? "No items match your search or filter."
                : canManage
                  ? "Add your first inventory item to start tracking stock."
                  : "No items have been added yet."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleItems.map((item) => {
                const status = getStatus(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {item.category?.name ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      <span
                        className={`font-medium ${STOCK_LEVEL_CLASS[status]}`}
                      >
                        {item.currentStock} {item.unit}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        / min {item.minStockThreshold}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatLastUpdated(item.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[status].variant}>
                        {STATUS_BADGE[status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Movement history"
                          onClick={() => setHistorySheet({ open: true, item })}
                        >
                          <History className="size-4" />
                        </Button>
                        {(canStock || canManage) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Stock actions"
                              >
                                <ArrowLeftRight className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canStock && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setMovementDialog({
                                        open: true,
                                        item,
                                        type: "in",
                                      })
                                    }
                                  >
                                    <ArrowUpCircle className="size-4 text-success" />
                                    Stock In
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setMovementDialog({
                                        open: true,
                                        item,
                                        type: "out",
                                      })
                                    }
                                  >
                                    <ArrowDownCircle className="size-4 text-destructive" />
                                    Stock Out
                                  </DropdownMenuItem>
                                </>
                              )}
                              {canManage && (
                                <>
                                  {canStock && <DropdownMenuSeparator />}
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setItemDialog({ open: true, item })
                                    }
                                  >
                                    <Pencil className="size-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                      setDeleteConfirm({ open: true, item })
                                    }
                                  >
                                    <Trash2 className="size-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
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
        defaultCategoryId={
          categoryFilter !== "all" ? categoryFilter : undefined
        }
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
            });
          }
        }}
      />

      <Sheet open={categoriesSheetOpen} onOpenChange={setCategoriesSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Manage Categories</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <InventoryCategoriesTab hotelId={hotelId} canManage={canManage} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
