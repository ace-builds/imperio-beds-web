import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { Download, Printer } from "lucide-react";
import { AppTopbar } from "@/components/app-topbar";
import {
  DailyReportSkeleton,
  DailyReportView,
} from "@/components/reports/daily-report";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDailyReport, useReportSummary } from "@/hooks/use-reports";
import { useActiveHotel } from "@/hooks/use-hotels";
import { useLowStockItems } from "@/hooks/use-inventory";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Daily Report — ImperioBed" }] }),
  component: ReportsPage,
});

const PERIODS = ["today", "yesterday", "week", "month"] as const;
type Period = (typeof PERIODS)[number];

const PERIOD_LABEL: Record<Period, string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "This Week",
  month: "This Month",
};

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Room status, attendance, and inventory alerts always reflect today's live
// state regardless of the selected period (see reportSummarySchema) — only
// revenue/check-in-out figures vary by period, so this only needs to cover
// the range those figures are drawn from.
function periodRange(period: Period, base: Date): { from: Date; to: Date } {
  switch (period) {
    case "today":
      return { from: base, to: base };
    case "yesterday": {
      const d = subDays(base, 1);
      return { from: d, to: d };
    }
    case "week":
      return { from: startOfWeek(base), to: endOfWeek(base) };
    case "month":
      return { from: startOfMonth(base), to: endOfMonth(base) };
  }
}

function ReportsPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { hotel } = useActiveHotel();
  const [period, setPeriod] = useState<Period>("today");

  const todayDate = useMemo(() => today(), []);
  const yesterdayDate = useMemo(() => subDays(todayDate, 1), [todayDate]);
  const { from, to } = useMemo(
    () => periodRange(period, todayDate),
    [period, todayDate],
  );

  // Today's report is always fetched — it backs the live-state sections
  // (room status, attendance issues, inventory alerts) no matter which
  // period tab is active, and doubles as the period stats when period is
  // "today" itself.
  const {
    data: todayReport,
    isLoading: isTodayLoading,
    isError,
    error,
  } = useDailyReport(activeHotelId ?? "", todayDate);
  const { data: yesterdayReport, isLoading: isYesterdayLoading } =
    useDailyReport(activeHotelId ?? "", yesterdayDate);
  const { data: summary, isLoading: isSummaryLoading } = useReportSummary(
    period === "week" || period === "month" ? (activeHotelId ?? "") : "",
    from,
    to,
  );
  const { data: lowStockItems } = useLowStockItems(activeHotelId ?? "");

  const periodStats =
    period === "today"
      ? todayReport && {
          checkInsCount: todayReport.checkIns.length,
          checkOutsCount: todayReport.checkOuts.length,
          revenueTotal: todayReport.revenue.totalPaymentsToday,
          revenueByMethod: todayReport.revenueByMethod,
        }
      : period === "yesterday"
        ? yesterdayReport && {
            checkInsCount: yesterdayReport.checkIns.length,
            checkOutsCount: yesterdayReport.checkOuts.length,
            revenueTotal: yesterdayReport.revenue.totalPaymentsToday,
            revenueByMethod: yesterdayReport.revenueByMethod,
          }
        : summary;

  const isLoading =
    isTodayLoading ||
    (period === "yesterday" && isYesterdayLoading) ||
    ((period === "week" || period === "month") && isSummaryLoading);

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Daily Operations Report">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
        >
          <Printer className="size-4" />
          Print
        </Button>
        {/* No PDF-rendering service exists yet — the browser's print dialog
            already offers "Save as PDF" as a destination, so this reuses it
            rather than pulling in a client-side PDF library for one button. */}
        <Button variant="default" size="sm" onClick={() => window.print()}>
          <Download className="size-4" />
          Download PDF
        </Button>
      </AppTopbar>

      <div className="p-4 lg:p-6 print:p-0">
        <div className="mb-4 flex items-center justify-between gap-4 print:hidden">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList>
              {PERIODS.map((p) => (
                <TabsTrigger key={p} value={p}>
                  {PERIOD_LABEL[p]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-6 hidden print:block">
          <h1 className="text-xl font-bold">Daily Operations Report</h1>
          <p className="text-sm text-muted-foreground">
            {PERIOD_LABEL[period]}
          </p>
        </div>

        {isLoading ? (
          <DailyReportSkeleton />
        ) : isError ? (
          <p className="text-sm text-destructive">{error?.message}</p>
        ) : todayReport && periodStats ? (
          <DailyReportView
            report={todayReport}
            periodStats={periodStats}
            previousRevenueTotal={
              period === "today"
                ? (yesterdayReport?.revenue.totalPaymentsToday ?? 0)
                : null
            }
            currency={hotel?.currency ?? "USD"}
            lowStockItems={lowStockItems ?? []}
          />
        ) : null}
      </div>

      <style>{`
        @media print {
          [data-slot="sidebar"],
          [data-slot="topbar"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
