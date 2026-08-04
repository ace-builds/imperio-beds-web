import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { FormPageBackLink, FormPageNotFound } from "@/components/form-page";
import { ItemForm } from "@/components/inventory/item-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryItems } from "@/hooks/use-inventory";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute(
  "/_authenticated/inventory/items/$itemId/edit",
)({
  head: () => ({ meta: [{ title: "Edit Item — ImperioBed" }] }),
  component: EditItemPage,
});

function EditItemPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { itemId } = Route.useParams();
  // The unfiltered item list is already cached by the inventory page, so this
  // reuses it rather than adding a single-item endpoint.
  const { data: items, isLoading } = useInventoryItems(activeHotelId ?? "");
  const item = items?.find((entry) => entry.id === itemId);

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Edit Inventory Item" />
      {isLoading ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 lg:p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : item ? (
        <ItemForm key={item.id} hotelId={activeHotelId} item={item} />
      ) : (
        <FormPageNotFound
          title="Item not found"
          description="This item may have been deleted, or belongs to a different hotel."
          backLink={<FormPageBackLink to="/inventory">Inventory</FormPageBackLink>}
        />
      )}
    </div>
  );
}
