import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { GuestsTable } from "@/components/guests/guests-table";
import { useActiveHotelRole } from "@/hooks/use-active-hotel-role";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/guests")({
  head: () => ({ meta: [{ title: "Guests — ImperioBed" }] }),
  component: GuestsPage,
});

function GuestsPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { role } = useActiveHotelRole();
  const canManage = role === "owner_admin" || role === "manager";

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Guests" />
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <GuestsTable hotelId={activeHotelId} canManage={canManage} />
      </div>
    </div>
  );
}
