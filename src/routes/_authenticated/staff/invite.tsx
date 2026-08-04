import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { InviteStaffForm } from "@/components/staff/invite-staff-form";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/staff/invite")({
  head: () => ({ meta: [{ title: "Invite Staff — ImperioBed" }] }),
  component: InviteStaffPage,
});

function InviteStaffPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Invite Staff Member" />
      <InviteStaffForm key={activeHotelId} hotelId={activeHotelId} />
    </div>
  );
}
