import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { RoomTypeForm } from "@/components/rooms/room-type-form";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/rooms/types/new")({
  head: () => ({ meta: [{ title: "Add Room Type — ImperioBed" }] }),
  component: NewRoomTypePage,
});

function NewRoomTypePage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Add Room Type" />
      <RoomTypeForm key={activeHotelId} hotelId={activeHotelId} />
    </div>
  );
}
