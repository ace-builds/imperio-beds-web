import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { ReservationForm } from "@/components/front-desk/reservation-form";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute(
  "/_authenticated/front-desk/reservations/new",
)({
  head: () => ({ meta: [{ title: "New Reservation — ImperioBed" }] }),
  component: NewReservationPage,
});

function NewReservationPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="New Reservation" />
      <ReservationForm key={activeHotelId} hotelId={activeHotelId} />
    </div>
  );
}
