import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppTopbar } from "@/components/app-topbar";
import { ItemForm } from "@/components/inventory/item-form";
import { useCurrentHotelStore } from "@/stores/current-hotel";

// Adding an item while the list is filtered to one category pre-selects it,
// which the old dialog passed down as a prop.
const newItemSearchSchema = z.object({
  categoryId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/inventory/items/new")({
  head: () => ({ meta: [{ title: "Add Item — ImperioBed" }] }),
  validateSearch: newItemSearchSchema,
  component: NewItemPage,
});

function NewItemPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { categoryId } = Route.useSearch();

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Add Inventory Item" />
      <ItemForm
        key={`${activeHotelId}:${categoryId ?? ""}`}
        hotelId={activeHotelId}
        defaultCategoryId={categoryId}
      />
    </div>
  );
}
