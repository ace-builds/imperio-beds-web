import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { StaffTable } from "@/components/staff/staff-table";
import { useActiveHotelRole } from "@/hooks/use-active-hotel-role";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/staff")({
  head: () => ({ meta: [{ title: "Staff — ImperioBed" }] }),
  component: StaffPage,
});

function StaffPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { role } = useActiveHotelRole();
  const canManage = role === "owner_admin";

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Staff Management" />
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <StaffTable hotelId={activeHotelId} canManage={canManage} />
      </div>
    </div>
  );
}
