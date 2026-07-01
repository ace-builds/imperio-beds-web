import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { subDays } from "date-fns";
import { ClipboardList, Home, UserPlus, Wallet } from "lucide-react";
import { AppTopbar } from "@/components/app-topbar";
import { DatePicker } from "@/components/date-picker";
import { ActivityFeedCard } from "@/components/dashboard/activity-feed-card";
import {
  buildActivityFeed,
  buildArrivals,
  buildCheckInsTrend,
  buildOccupancySegments,
  buildOccupancyTrend,
  buildPendingTasksStat,
  buildRevenueTrend,
  buildStaffShift,
  countStaysCheckedInOn,
  formatCurrency,
  occupancySnapshotFromRooms,
  pendingArrivalsForDate,
} from "@/components/dashboard/derive";
import { RoomStatusCard } from "@/components/dashboard/room-status-card";
import { StaffShiftCard } from "@/components/dashboard/staff-shift-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { useActiveHotelRole } from "@/hooks/use-active-hotel-role";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import { useActiveHotel, useHotelStaff } from "@/hooks/use-hotels";
import { useLowStockItems } from "@/hooks/use-inventory";
import { useDailyReport } from "@/hooks/use-reports";
import { useReservations } from "@/hooks/use-reservations";
import { useRooms } from "@/hooks/use-rooms";
import { useStays } from "@/hooks/use-stays";
import { canAccess } from "@/lib/roles";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Dashboard — ImperioBed" }] }),
  component: DashboardPage,
});

// Same role lists as the server's HotelRoles() guards on each endpoint this
// page reads from — kept in sync by hand per this repo's no-shared-package
// convention. Cards backed by a restricted endpoint fetch nothing (and hide
// themselves) for roles outside these lists, mirroring how src/lib/roles.tsx
// already hides sidebar entries a role can't use.
const REPORT_ROLES = ["owner_admin", "manager", "accountant"] as const;
const RESERVATION_READ_ROLES = [
  "owner_admin",
  "manager",
  "front_desk",
  "accountant",
] as const;
const STAFF_ROLES = ["owner_admin"] as const;
const AUDIT_LOG_ROLES = ["owner_admin"] as const;
const LOW_STOCK_ROLES = [
  "owner_admin",
  "manager",
  "storekeeper",
  "accountant",
  "front_desk",
] as const;

function DashboardPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { role } = useActiveHotelRole();
  const { hotel } = useActiveHotel();
  const [date, setDate] = useState(new Date());

  const canSeeReports = canAccess(role, [...REPORT_ROLES]);
  const canSeeReservations = canAccess(role, [...RESERVATION_READ_ROLES]);
  const canSeeStaff = canAccess(role, [...STAFF_ROLES]);
  const canSeeAuditLog = canAccess(role, [...AUDIT_LOG_ROLES]);
  const canSeeLowStock = canAccess(role, [...LOW_STOCK_ROLES]);

  const { data: rooms } = useRooms(activeHotelId ?? "");
  const { data: stays } = useStays(activeHotelId ?? "");
  const { data: todayReport } = useDailyReport(
    canSeeReports ? (activeHotelId ?? "") : "",
    date,
  );
  const { data: yesterdayReport } = useDailyReport(
    canSeeReports ? (activeHotelId ?? "") : "",
    subDays(date, 1),
  );
  const { data: reservations } = useReservations(
    canSeeReservations ? (activeHotelId ?? "") : "",
    "pending",
  );
  const { data: lowStockItems } = useLowStockItems(
    canSeeLowStock ? (activeHotelId ?? "") : "",
  );
  const { data: staffData } = useHotelStaff(
    canSeeStaff ? (activeHotelId ?? "") : "",
  );
  const { data: auditLogs } = useAuditLogs(
    canSeeAuditLog ? (activeHotelId ?? "") : "",
    { page: 1 },
  );

  const occupancy = useMemo(
    () => occupancySnapshotFromRooms(rooms ?? []),
    [rooms],
  );

  const roomTypeNameByRoomId = useMemo(
    () => new Map((rooms ?? []).map((room) => [room.id, room.roomType.name])),
    [rooms],
  );

  const pendingArrivals = reservations
    ? pendingArrivalsForDate(reservations, date)
    : null;
  const arrivals = pendingArrivals
    ? buildArrivals(pendingArrivals, roomTypeNameByRoomId)
    : null;

  const checkInsToday = countStaysCheckedInOn(stays ?? [], date);
  const pendingTasks = buildPendingTasksStat(
    occupancy,
    canSeeLowStock ? (lowStockItems?.length ?? null) : null,
  );

  const currency = hotel?.currency ?? "USD";
  const revenueToday = todayReport?.revenue.totalPaymentsToday ?? 0;
  const revenueYesterday = yesterdayReport?.revenue.totalPaymentsToday ?? 0;

  const stats = [
    canSeeReports && {
      label: "Revenue Today",
      value: formatCurrency(revenueToday, currency),
      icon: Wallet,
      trend: buildRevenueTrend(revenueToday, revenueYesterday),
    },
    {
      label: "Occupancy",
      value: `${occupancy.occupancyRate}%`,
      icon: Home,
      trend: buildOccupancyTrend(occupancy),
    },
    {
      label: "Check-ins Today",
      value: String(checkInsToday),
      icon: UserPlus,
      trend: buildCheckInsTrend(canSeeReservations ? (arrivals?.length ?? null) : null),
    },
    {
      label: "Pending Tasks",
      value: String(pendingTasks.value),
      icon: ClipboardList,
      trend: pendingTasks.trend,
    },
  ].filter((stat): stat is Exclude<typeof stat, false> => stat !== false);

  const staffShift = canSeeStaff ? buildStaffShift(staffData?.staff ?? []) : null;
  const activity = canSeeAuditLog
    ? buildActivityFeed((auditLogs?.data ?? []).slice(0, 6))
    : null;

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Dashboard">
        <DatePicker date={date} onDateChange={setDate} />
      </AppTopbar>

      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className={`grid gap-4 ${staffShift ? "lg:grid-cols-3" : ""}`}>
          <RoomStatusCard
            segments={buildOccupancySegments(occupancy)}
            arrivals={arrivals}
            className={staffShift ? undefined : "lg:col-span-3"}
          />
          {staffShift && (
            <StaffShiftCard title="Staff on Duty" staff={staffShift} />
          )}
        </div>

        {activity && <ActivityFeedCard activity={activity} />}
      </div>
    </div>
  );
}
