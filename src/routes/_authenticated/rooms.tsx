import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { RoomsTab } from "@/components/rooms/rooms-tab";
import { RoomTypesTab } from "@/components/rooms/room-types-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveHotelRole } from "@/hooks/use-active-hotel-role";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/rooms")({
  head: () => ({ meta: [{ title: "Rooms — ImperioBed" }] }),
  component: RoomsPage,
});

function RoomsPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { role } = useActiveHotelRole();
  const canManage = role === "owner_admin" || role === "manager";

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Room Management" />
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <Tabs defaultValue="rooms">
          <TabsList>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="room-types">Room Types</TabsTrigger>
          </TabsList>
          <TabsContent value="rooms">
            <RoomsTab hotelId={activeHotelId} canManage={canManage} />
          </TabsContent>
          <TabsContent value="room-types">
            <RoomTypesTab hotelId={activeHotelId} canManage={canManage} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
