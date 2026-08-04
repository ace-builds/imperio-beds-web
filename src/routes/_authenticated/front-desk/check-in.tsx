import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppTopbar } from "@/components/app-topbar";
import { WalkInForm } from "@/components/front-desk/walk-in-form";
import { useCurrentHotelStore } from "@/stores/current-hotel";

// Opening this page from a room card carries the room over in the URL, so the
// selection survives a refresh — the router owns it, not component state.
const checkInSearchSchema = z.object({
  roomId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/front-desk/check-in")({
  head: () => ({ meta: [{ title: "New Walk-in — ImperioBed" }] }),
  validateSearch: checkInSearchSchema,
  component: CheckInPage,
});

function CheckInPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { roomId } = Route.useSearch();

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="New Walk-in" />
      <WalkInForm
        key={`${activeHotelId}:${roomId ?? ""}`}
        hotelId={activeHotelId}
        initialRoomId={roomId}
      />
    </div>
  );
}
