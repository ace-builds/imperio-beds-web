import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { InventoryItemsTable } from "@/components/inventory/inventory-items-table";
import { InventoryStats } from "@/components/inventory/inventory-stats";
import { useActiveHotelRole } from "@/hooks/use-active-hotel-role";
import { useActiveHotel } from "@/hooks/use-hotels";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/inventory")({
  head: () => ({ meta: [{ title: "Inventory — ImperioBed" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { role } = useActiveHotelRole();
  const { hotel } = useActiveHotel();

  const canManage = role === "owner_admin" || role === "manager";
  const canStock =
    role === "owner_admin" || role === "manager" || role === "storekeeper";

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Inventory Management" />
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <InventoryStats hotelId={activeHotelId} currency={hotel?.currency} />
        <InventoryItemsTable
          hotelId={activeHotelId}
          canManage={canManage}
          canStock={canStock}
        />
      </div>
    </div>
  );
}
