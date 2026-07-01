import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { InventoryCategoriesTab } from "@/components/inventory/inventory-categories-tab";
import { InventoryItemsTab } from "@/components/inventory/inventory-items-tab";
import { LowStockTab } from "@/components/inventory/low-stock-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveHotelRole } from "@/hooks/use-active-hotel-role";
import { useLowStockItems } from "@/hooks/use-inventory";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/inventory")({
  head: () => ({ meta: [{ title: "Inventory — ImperioBed" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { role } = useActiveHotelRole();

  const canManage = role === "owner_admin" || role === "manager";
  const canStock =
    role === "owner_admin" || role === "manager" || role === "storekeeper";

  const { data: lowStockItems } = useLowStockItems(activeHotelId ?? "");
  const lowStockCount = lowStockItems?.length ?? 0;

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Inventory" />
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <Tabs defaultValue="items">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="low-stock" className="relative">
              Low Stock
              {lowStockCount > 0 && (
                <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
                  {lowStockCount}
                </span>
              )}
            </TabsTrigger>
            {canManage && (
              <TabsTrigger value="categories">Categories</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="items" className="mt-4">
            <InventoryItemsTab
              hotelId={activeHotelId}
              canManage={canManage}
              canStock={canStock}
            />
          </TabsContent>

          <TabsContent value="low-stock" className="mt-4">
            <LowStockTab hotelId={activeHotelId} canStock={canStock} />
          </TabsContent>

          {canManage && (
            <TabsContent value="categories" className="mt-4">
              <InventoryCategoriesTab hotelId={activeHotelId} canManage={canManage} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
