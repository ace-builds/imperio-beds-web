import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { FormPageBackLink, FormPageNotFound } from "@/components/form-page";
import { GuestForm } from "@/components/guests/guest-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuests } from "@/hooks/use-guests";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/guests/$guestId/edit")({
  head: () => ({ meta: [{ title: "Edit Guest — ImperioBed" }] }),
  component: EditGuestPage,
});

function EditGuestPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { guestId } = Route.useParams();
  // Guests are replicated locally (RxDB), so reading the one being edited off
  // the list is instant and needs no extra endpoint.
  const { data: guests, isLoading } = useGuests(activeHotelId ?? "");
  const guest = guests?.find((item) => item.id === guestId);

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Edit Guest" />
      {isLoading ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 lg:p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : guest ? (
        <GuestForm key={guest.id} hotelId={activeHotelId} guest={guest} />
      ) : (
        <FormPageNotFound
          title="Guest not found"
          description="This guest may have been removed, or belongs to a different hotel."
          backLink={<FormPageBackLink to="/guests">Guests</FormPageBackLink>}
        />
      )}
    </div>
  );
}
