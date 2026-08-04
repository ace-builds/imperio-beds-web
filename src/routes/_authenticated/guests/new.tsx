import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { GuestForm } from "@/components/guests/guest-form";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/guests/new")({
  head: () => ({ meta: [{ title: "Add Guest — ImperioBed" }] }),
  component: NewGuestPage,
});

function NewGuestPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Add New Guest" />
      <GuestForm key={activeHotelId} hotelId={activeHotelId} />
    </div>
  );
}
