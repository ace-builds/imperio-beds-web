import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { FormPageBackLink, FormPageNotFound } from "@/components/form-page";
import { RoomForm } from "@/components/rooms/room-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useRooms } from "@/hooks/use-rooms";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/rooms/$roomId/edit")({
  head: () => ({ meta: [{ title: "Edit Room — ImperioBed" }] }),
  component: EditRoomPage,
});

function EditRoomPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { roomId } = Route.useParams();
  const { data: rooms, isLoading } = useRooms(activeHotelId ?? "");
  const room = rooms?.find((item) => item.id === roomId);

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Edit Room" />
      {isLoading ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 lg:p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : room ? (
        <RoomForm key={room.id} hotelId={activeHotelId} room={room} />
      ) : (
        <FormPageNotFound
          title="Room not found"
          description="This room may have been deleted, or belongs to a different hotel."
          backLink={
            <FormPageBackLink to="/rooms" search={{ tab: "rooms" }}>
              Rooms
            </FormPageBackLink>
          }
        />
      )}
    </div>
  );
}
