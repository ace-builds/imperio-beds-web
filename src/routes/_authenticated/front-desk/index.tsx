import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { Button } from "@/components/ui/button";
import { AddNoteDialog } from "@/components/front-desk/add-note-dialog";
import { ExtendStayDialog } from "@/components/front-desk/extend-stay-dialog";
import { MoveStayDialog } from "@/components/front-desk/move-stay-dialog";
import { PaymentDialog } from "@/components/front-desk/payment-dialog";
import { RoomBoard } from "@/components/front-desk/room-board";
import { StayDetailSheet } from "@/components/front-desk/stay-detail-sheet";
import { TodaysLedger } from "@/components/front-desk/todays-ledger";
import { useAddRoomNote, useRooms } from "@/hooks/use-rooms";
import { useStays } from "@/hooks/use-stays";
import { useCurrentHotelStore } from "@/stores/current-hotel";
import type { RoomWithDetails } from "@/lib/schemas/room";
import type { StayWithGuestRoom } from "@/lib/schemas/stay";

export const Route = createFileRoute("/_authenticated/front-desk/")({
  head: () => ({ meta: [{ title: "Front Desk — ImperioBed" }] }),
  component: FrontDeskPage,
});

function FrontDeskPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const navigate = useNavigate();

  const [viewStayId, setViewStayId] = useState<string | null>(null);
  const [extendOpen, setExtendOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [noteRoom, setNoteRoom] = useState<RoomWithDetails | null>(null);

  const { data: rooms } = useRooms(activeHotelId ?? "");
  const { data: activeStays } = useStays(activeHotelId ?? "", "active");
  const addRoomNote = useAddRoomNote(activeHotelId ?? "");

  if (!activeHotelId) return null;

  const availableRooms = (rooms ?? []).filter(
    (room) => room.status === "available",
  );

  // Checking in from a specific room card carries that room over as a search
  // param, so the check-in page opens with it pre-selected — and the URL alone
  // is enough to restore that state on a refresh or a shared link.
  function openWalkIn(roomId?: string) {
    void navigate({ to: "/front-desk/check-in", search: { roomId } });
  }

  function openStay(stay: StayWithGuestRoom) {
    setViewStayId(stay.id);
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Front Desk Operations">
        <Button asChild>
          <Link to="/front-desk/check-in">+ New Walk-in</Link>
        </Button>
      </AppTopbar>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_320px] lg:p-6">
        <RoomBoard
          hotelId={activeHotelId}
          rooms={rooms ?? []}
          activeStays={activeStays ?? []}
          onCheckIn={openWalkIn}
          onViewStay={openStay}
          onAddNote={setNoteRoom}
        />

        <TodaysLedger hotelId={activeHotelId} onViewStay={openStay} />
      </div>

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

      <AddNoteDialog
        open={!!noteRoom}
        onOpenChange={(open) => !open && setNoteRoom(null)}
        title={`Add Note — Room ${noteRoom?.number ?? ""}`}
        pending={addRoomNote.isPending}
        error={addRoomNote.error?.message}
        onSubmit={(body) => {
          if (!noteRoom) return;
          addRoomNote.mutate(
            { roomId: noteRoom.id, body },
            { onSuccess: () => setNoteRoom(null) },
          );
        }}
      />
    </div>
  );
}
