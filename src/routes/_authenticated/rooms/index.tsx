import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { AppTopbar } from "@/components/app-topbar";
import { RoomsTab } from "@/components/rooms/rooms-tab";
import { RoomTypesTab } from "@/components/rooms/room-types-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveHotelRole } from "@/hooks/use-active-hotel-role";
import { useCurrentHotelStore } from "@/stores/current-hotel";

// The active tab lives in the URL so that returning from /rooms/types/new
// lands back on Room Types rather than resetting to Rooms.
const roomsSearchSchema = z.object({
  tab: z.enum(["rooms", "types"]).default("rooms"),
});

export const Route = createFileRoute("/_authenticated/rooms/")({
  head: () => ({ meta: [{ title: "Rooms — ImperioBed" }] }),
  validateSearch: roomsSearchSchema,
  component: RoomsPage,
});

function RoomsPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { role } = useActiveHotelRole();
  const { tab } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const canManage = role === "owner_admin" || role === "manager";

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Room Management" />
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <Tabs
          value={tab}
          onValueChange={(value) =>
            void navigate({
              search: { tab: value as "rooms" | "types" },
              replace: true,
            })
          }
        >
          <TabsList>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="types">Room Types</TabsTrigger>
          </TabsList>
          <TabsContent value="rooms">
            <RoomsTab hotelId={activeHotelId} canManage={canManage} />
          </TabsContent>
          <TabsContent value="types">
            <RoomTypesTab hotelId={activeHotelId} canManage={canManage} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
