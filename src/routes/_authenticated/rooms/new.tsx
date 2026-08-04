import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { RoomForm } from "@/components/rooms/room-form";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/rooms/new")({
  head: () => ({ meta: [{ title: "Add Room — ImperioBed" }] }),
  component: NewRoomPage,
});

function NewRoomPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Add Room" />
      <RoomForm key={activeHotelId} hotelId={activeHotelId} />
    </div>
  );
}
