import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { DatePicker } from "@/components/date-picker";
import { ActivityFeedCard } from "@/components/dashboard/activity-feed-card";
import { RoomStatusCard } from "@/components/dashboard/room-status-card";
import { StaffShiftCard } from "@/components/dashboard/staff-shift-card";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  ACTIVITY_FEED,
  ARRIVALS,
  MORNING_SHIFT,
  ROOM_STATUS_SEGMENTS,
  STATS,
} from "@/components/dashboard/mock-data";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Dashboard — ImperioBed" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const [date, setDate] = useState(new Date());

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Dashboard">
        <DatePicker date={date} onDateChange={setDate} />
      </AppTopbar>

      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <RoomStatusCard segments={ROOM_STATUS_SEGMENTS} arrivals={ARRIVALS} />
          <StaffShiftCard
            title="Staff on Shift (Morning)"
            staff={MORNING_SHIFT}
          />
        </div>

        <ActivityFeedCard activity={ACTIVITY_FEED} />
      </div>
    </div>
  );
}
