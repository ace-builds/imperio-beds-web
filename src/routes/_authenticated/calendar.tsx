import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppTopbar } from "@/components/app-topbar";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BlockedRoomsPanel } from "@/components/calendar/blocked-rooms-panel";
import { ReservationDetailSheet } from "@/components/calendar/reservation-detail-sheet";
import { ReservationsCalendarGrid } from "@/components/calendar/reservations-calendar-grid";
import { RoomBlockSheet } from "@/components/calendar/room-block-sheet";
import { ExtendStayDialog } from "@/components/front-desk/extend-stay-dialog";
import { MoveStayDialog } from "@/components/front-desk/move-stay-dialog";
import { PaymentDialog } from "@/components/front-desk/payment-dialog";
import { StayDetailSheet } from "@/components/front-desk/stay-detail-sheet";
import { groupEventsByDay } from "@/lib/calendar-events";
import { useReservations } from "@/hooks/use-reservations";
import { useRooms } from "@/hooks/use-rooms";
import { useStays } from "@/hooks/use-stays";
import { useCurrentHotelStore } from "@/stores/current-hotel";
import type { ReservationWithGuestRoom } from "@/lib/schemas/reservation";
import type { RoomWithDetails } from "@/lib/schemas/room";
import type { StayWithGuestRoom } from "@/lib/schemas/stay";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Calendar — ImperioBed" }] }),
  component: CalendarPage,
});

type ViewMode = "month" | "week";

function CalendarPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationWithGuestRoom | null>(null);
  const [viewStayId, setViewStayId] = useState<string | null>(null);
  const [extendOpen, setExtendOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [blockedRoom, setBlockedRoom] = useState<RoomWithDetails | null>(null);

  const { data: reservations } = useReservations(activeHotelId ?? "");
  const { data: stays } = useStays(activeHotelId ?? "");
  const { data: rooms } = useRooms(activeHotelId ?? "");

  const days = useMemo(() => {
    if (viewMode === "week") {
      return eachDayOfInterval({
        start: startOfWeek(anchorDate),
        end: endOfWeek(anchorDate),
      });
    }
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(anchorDate)),
      end: endOfWeek(endOfMonth(anchorDate)),
    });
  }, [viewMode, anchorDate]);

  const eventsByDay = useMemo(
    () => groupEventsByDay(reservations ?? [], stays ?? []),
    [reservations, stays],
  );

  if (!activeHotelId) return null;

  const availableRooms = (rooms ?? []).filter((room) => room.status !== "occupied");

  function goToPrevious() {
    setAnchorDate((current) =>
      viewMode === "week" ? subWeeks(current, 1) : subMonths(current, 1),
    );
  }

  function goToNext() {
    setAnchorDate((current) =>
      viewMode === "week" ? addWeeks(current, 1) : addMonths(current, 1),
    );
  }

  function openStay(stay: StayWithGuestRoom) {
    setViewStayId(stay.id);
  }

  const rangeLabel =
    viewMode === "month"
      ? format(anchorDate, "MMMM yyyy")
      : `${format(startOfWeek(anchorDate), "MMM d")} – ${format(endOfWeek(anchorDate), "MMM d, yyyy")}`;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Reservations & Events Calendar">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as ViewMode)}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
        </ToggleGroup>
      </AppTopbar>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_260px] lg:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" onClick={goToPrevious} aria-label="Previous">
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAnchorDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon-sm" onClick={goToNext} aria-label="Next">
                <ChevronRight />
              </Button>
            </div>
            <h2 className="text-sm font-medium">{rangeLabel}</h2>
          </div>

          <ReservationsCalendarGrid
            days={days}
            anchorDate={anchorDate}
            eventsByDay={eventsByDay}
            onSelectReservation={setSelectedReservation}
            onSelectStay={openStay}
            tall={viewMode === "week"}
          />
        </div>

        <BlockedRoomsPanel rooms={rooms ?? []} onSelectRoom={setBlockedRoom} />
      </div>

      <ReservationDetailSheet
        open={!!selectedReservation}
        onOpenChange={(open) => !open && setSelectedReservation(null)}
        hotelId={activeHotelId}
        reservation={selectedReservation}
        onViewStay={(stayId) => setViewStayId(stayId)}
      />

      <StayDetailSheet
        open={!!viewStayId}
        onOpenChange={(open) => !open && setViewStayId(null)}
        hotelId={activeHotelId}
        stayId={viewStayId ?? undefined}
        onExtend={() => setExtendOpen(true)}
        onMove={() => setMoveOpen(true)}
        onPayment={() => setPaymentOpen(true)}
      />

      <ExtendStayDialog
        open={extendOpen}
        onOpenChange={setExtendOpen}
        hotelId={activeHotelId}
        stayId={viewStayId}
      />

      <MoveStayDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        hotelId={activeHotelId}
        stayId={viewStayId}
        availableRooms={availableRooms}
      />

      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        hotelId={activeHotelId}
        stayId={viewStayId}
      />

      <RoomBlockSheet
        open={!!blockedRoom}
        onOpenChange={(open) => !open && setBlockedRoom(null)}
        hotelId={activeHotelId}
        room={blockedRoom}
      />
    </div>
  );
}
