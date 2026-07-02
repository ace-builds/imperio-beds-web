import {
  AlertTriangle,
  ArrowLeftRight,
  Home,
  Users,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildRevenueTrend, formatCurrency } from "@/components/dashboard/derive";
import { RoomStatusBar } from "@/components/dashboard/room-status-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import type { StatTrend } from "@/components/dashboard/types";
import type { DailyReport, RevenueByMethodRow } from "@/lib/schemas/report";
import type { InventoryItem } from "@/lib/schemas/inventory";

const PAYMENT_METHOD_LABEL: Record<RevenueByMethodRow["method"], string> = {
  cash: "Cash",
  transfer: "Transfer",
  pos: "POS",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatTime(date: Date | string | null) {
  if (!date) return "—";
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type PeriodStats = {
  checkInsCount: number;
  checkOutsCount: number;
  revenueTotal: number;
  revenueByMethod: RevenueByMethodRow[];
};

export function DailyReportView({
  report,
  periodStats,
  previousRevenueTotal,
  currency,
  lowStockItems,
}: {
  report: DailyReport;
  periodStats: PeriodStats;
  // Only meaningful for the "Today" period (compares against yesterday);
  // null otherwise since "vs yesterday" doesn't apply to Yesterday/Week/Month.
  previousRevenueTotal: number | null;
  currency: string;
  lowStockItems: InventoryItem[];
}) {
  const { occupancy, staffAttendance, checkIns, checkOuts } = report;
  const { issues } = staffAttendance;

  const revenueTrend: StatTrend =
    previousRevenueTotal !== null
      ? buildRevenueTrend(periodStats.revenueTotal, previousRevenueTotal)
      : {
          label: `${periodStats.revenueByMethod.reduce((sum, r) => sum + r.count, 0)} transactions`,
          tone: "muted",
        };

  const checkInsOutsTrend: StatTrend = {
    label: `${periodStats.checkInsCount + periodStats.checkOutsCount} movements`,
    tone: "muted",
  };

  const attendanceTrend: StatTrend =
    issues.length > 0
      ? { label: `${issues.length} issue${issues.length === 1 ? "" : "s"} today`, tone: "destructive" }
      : { label: "All on time", tone: "success" };

  const revenueTotal = periodStats.revenueByMethod.reduce(
    (sum, row) => sum + row.amount,
    0,
  );
  const revenueTransactions = periodStats.revenueByMethod.reduce(
    (sum, row) => sum + row.count,
    0,
  );

  const roomStatusSegments = [
    { label: "Occupied", count: occupancy.occupied, tone: "destructive" as const },
    {
      label: "Clean/Maint.",
      count: occupancy.cleaning + occupancy.maintenance,
      tone: "warning" as const,
    },
    { label: "Free", count: occupancy.available, tone: "success" as const },
  ];

  return (
    <div className="flex flex-col gap-4 print:gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(periodStats.revenueTotal, currency)}
          icon={Wallet}
          trend={revenueTrend}
        />
        <StatCard
          label="Occupancy Rate"
          value={`${occupancy.occupancyRate}%`}
          icon={Home}
          trend={{ label: `${occupancy.occupied} / ${occupancy.total} Rooms`, tone: "muted" }}
        />
        <StatCard
          label="Check-ins / Outs"
          value={`${periodStats.checkInsCount} / ${periodStats.checkOutsCount}`}
          icon={ArrowLeftRight}
          trend={checkInsOutsTrend}
        />
        <StatCard
          label="Staff On Duty"
          value={String(staffAttendance.onDutyCount)}
          icon={Users}
          trend={attendanceTrend}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {periodStats.revenueByMethod.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No payments recorded for this period.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Transactions</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {periodStats.revenueByMethod.map((row) => (
                        <TableRow key={row.method}>
                          <TableCell className="font-medium">
                            {PAYMENT_METHOD_LABEL[row.method]}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {row.count}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(row.amount, currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {revenueTransactions}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(revenueTotal, currency)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Room Status Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <RoomStatusBar segments={roomStatusSegments} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Issues</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y">
              {staffAttendance.scheduledCount === 0 ? (
                <p className="py-2.5 text-sm text-muted-foreground first:pt-0">
                  No shifts scheduled today.
                </p>
              ) : issues.length === 0 ? (
                <p className="py-2.5 text-sm text-muted-foreground first:pt-0">
                  No attendance issues today.
                </p>
              ) : (
                issues.map((issue) => (
                  <div
                    key={issue.staffId}
                    className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <Avatar>
                      <AvatarImage src={issue.image ?? undefined} alt={issue.name} />
                      <AvatarFallback>{initials(issue.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium">{issue.name}</span>
                      <span className="text-xs text-muted-foreground">{issue.role}</span>
                    </div>
                    <Badge variant="destructive">
                      {issue.status === "late"
                        ? `Late: ${issue.lateMinutes}m`
                        : "Absent"}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y">
              {lowStockItems.length === 0 ? (
                <p className="py-2.5 text-sm text-muted-foreground first:pt-0">
                  No items low on stock.
                </p>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.category?.name ?? item.unit}
                      </span>
                    </div>
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="size-3" />
                      Low ({item.currentStock})
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Today's Check-ins ({checkIns.length})
        </h2>
        {checkIns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No check-ins today.</p>
        ) : (
          <StayTable stays={checkIns} timeKey="checkInAt" currency={currency} />
        )}
      </section>

      <Separator />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Today's Check-outs ({checkOuts.length})
        </h2>
        {checkOuts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No check-outs today.</p>
        ) : (
          <StayTable stays={checkOuts} timeKey="checkOutAt" currency={currency} />
        )}
      </section>
    </div>
  );
}

function StayTable({
  stays,
  timeKey,
  currency,
}: {
  stays: DailyReport["checkIns"];
  timeKey: "checkInAt" | "checkOutAt";
  currency: string;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stays.map((stay) => (
            <TableRow key={stay.id}>
              <TableCell className="font-medium">{stay.guestName}</TableCell>
              <TableCell>{stay.roomNumber}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatTime(
                  timeKey === "checkInAt" ? stay.checkInAt : stay.checkOutAt,
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(stay.totalPaid, currency)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {stay.balance > 0 ? (
                  <span className="text-destructive">
                    {formatCurrency(stay.balance, currency)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function DailyReportSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-24 w-full" />
        </div>
      ))}
    </div>
  );
}
