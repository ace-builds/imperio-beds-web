import { CreditCard, Settings as SettingsIcon } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { ComingSoon } from "@/components/coming-soon";
import { GeneralTab } from "@/components/settings/general-tab";
import { RoomTypesTab } from "@/components/rooms/room-types-tab";
import { StaffTable } from "@/components/staff/staff-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveHotelRole } from "@/hooks/use-active-hotel-role";
import { useActiveHotel } from "@/hooks/use-hotels";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — ImperioBed" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { hotel, isLoading } = useActiveHotel();
  const { role } = useActiveHotelRole();
  const canManage = role === "owner_admin";

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <AppTopbar title="Settings" />
        <p className="p-6 text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex flex-1 flex-col">
        <AppTopbar title="Settings" />
        <ComingSoon
          icon={SettingsIcon}
          title="No hotel selected"
          description="Choose a hotel to manage its settings."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Settings" />
      <div className="p-4 lg:p-6">
        <Tabs
          defaultValue="general"
          orientation="vertical"
          className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-6"
        >
          <TabsList className="h-fit w-full flex-col items-stretch bg-transparent p-0">
            <TabsTrigger value="general" className="justify-start">
              General
            </TabsTrigger>
            <TabsTrigger value="room-types" className="justify-start">
              Room Types
            </TabsTrigger>
            <TabsTrigger value="users-roles" className="justify-start">
              Users &amp; Roles
            </TabsTrigger>
            <TabsTrigger value="notifications" className="justify-start">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing" className="justify-start">
              Billing &amp; Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralTab hotel={hotel} canManage={canManage} />
          </TabsContent>
          <TabsContent value="room-types">
            <RoomTypesTab hotelId={hotel.id} canManage={canManage} />
          </TabsContent>
          <TabsContent value="users-roles">
            <StaffTable hotelId={hotel.id} canManage={canManage} />
          </TabsContent>
          <TabsContent value="notifications">
            <ComingSoon
              icon={SettingsIcon}
              title="Notifications"
              description="Notification preferences aren't configurable yet."
            />
          </TabsContent>
          <TabsContent value="billing">
            <ComingSoon
              icon={CreditCard}
              title="Billing & Plan"
              description="Billing and plan management aren't built yet."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
