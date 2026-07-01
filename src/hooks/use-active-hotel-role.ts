import { useCurrentHotelStore } from "@/stores/current-hotel";
import { useMyHotelAccess } from "./use-hotel-access";

export function useActiveHotelRole() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { data: hotelAccess, isLoading } = useMyHotelAccess();

  const activeHotel = hotelAccess?.find(
    (item) => item.hotelId === activeHotelId,
  );

  return { activeHotel, role: activeHotel?.role, isLoading };
}
