import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { FormPageBackLink, FormPageNotFound } from "@/components/form-page";
import { RoomTypeForm } from "@/components/rooms/room-type-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoomTypes } from "@/hooks/use-room-types";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute(
  "/_authenticated/rooms/types/$roomTypeId/edit",
)({
  head: () => ({ meta: [{ title: "Edit Room Type — ImperioBed" }] }),
  component: EditRoomTypePage,
});

function EditRoomTypePage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { roomTypeId } = Route.useParams();
  const { data: roomTypes, isLoading } = useRoomTypes(activeHotelId ?? "");
  const roomType = roomTypes?.find((item) => item.id === roomTypeId);

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Edit Room Type" />
      {isLoading ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 lg:p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : roomType ? (
        <RoomTypeForm
          key={roomType.id}
          hotelId={activeHotelId}
          roomType={roomType}
        />
      ) : (
        <FormPageNotFound
          title="Room type not found"
          description="This room type may have been deleted, or belongs to a different hotel."
          backLink={
            <FormPageBackLink to="/rooms" search={{ tab: "types" }}>
              Room Types
            </FormPageBackLink>
          }
        />
      )}
    </div>
  );
}
