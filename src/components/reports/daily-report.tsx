import {
  AlertTriangle,
  BedDouble,
  DollarSign,
  PackageOpen,
  TrendingUp,
} from "lucide-react";
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
import type { DailyReport } from "@/lib/schemas/report";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
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

export function DailyReportView({ report }: { report: DailyReport }) {
  const { occupancy, revenue, checkIns, checkOuts, inventoryUsage } = report;

  return (
    <div className="flex flex-col gap-6 print:gap-4">
      {/* Occupancy */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <BedDouble className="size-4 print:hidden" />
          Occupancy Snapshot
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard
            label="Occupancy Rate"
            value={`${occupancy.occupancyRate}%`}
            highlight
          />
          <StatCard label="Total Rooms" value={String(occupancy.total)} />
          <StatCard label="Occupied" value={String(occupancy.occupied)} />
          <StatCard label="Available" value={String(occupancy.available)} />
          <StatCard
            label="Cleaning / Maintenance"
            value={String(occupancy.cleaning + occupancy.maintenance)}
          />
        </div>
      </section>

      <Separator />

      {/* Revenue */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <DollarSign className="size-4 print:hidden" />
          Revenue
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Payments Today"
            value={formatCurrency(revenue.totalPaymentsToday)}
            highlight
          />
          <StatCard
            label="Outstanding Balance"
            value={formatCurrency(revenue.totalOutstandingBalance)}
            warn={revenue.totalOutstandingBalance > 0}
          />
        </div>
      </section>

      <Separator />

      {/* Check-ins */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <TrendingUp className="size-4 print:hidden" />
          Check-ins ({checkIns.length})
        </h2>
        {checkIns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No check-ins today.</p>
        ) : (
          <StayTable stays={checkIns} timeKey="checkInAt" />
        )}
      </section>

      <Separator />

      {/* Check-outs */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <TrendingUp className="size-4 rotate-180 print:hidden" />
          Check-outs ({checkOuts.length})
        </h2>
        {checkOuts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No check-outs today.</p>
        ) : (
          <StayTable stays={checkOuts} timeKey="checkOutAt" />
        )}
      </section>

      <Separator />

      {/* Inventory usage */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <PackageOpen className="size-4 print:hidden" />
          Inventory Usage Today ({inventoryUsage.length} item
          {inventoryUsage.length !== 1 ? "s" : ""})
        </h2>
        {inventoryUsage.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No inventory movements today.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Used Today</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryUsage.map((row) => (
                  <TableRow key={row.itemId}>
                    <TableCell className="font-medium">
                      {row.itemName}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.quantityUsed} {row.unit}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.currentStock} {row.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.isLowStock ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="size-3" />
                          Low
                        </Badge>
                      ) : (
                        <Badge variant="secondary">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <Card className={warn ? "border-destructive/40" : ""}>
      <CardHeader className="pb-1 pt-3">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <p
          className={`text-xl font-bold tabular-nums ${
            highlight
              ? "text-foreground"
              : warn
                ? "text-destructive"
                : "text-foreground"
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function StayTable({
  stays,
  timeKey,
}: {
  stays: DailyReport["checkIns"];
  timeKey: "checkInAt" | "checkOutAt";
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
                {formatCurrency(stay.totalPaid)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {stay.balance > 0 ? (
                  <span className="text-destructive">
                    {formatCurrency(stay.balance)}
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
