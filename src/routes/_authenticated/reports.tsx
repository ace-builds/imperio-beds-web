import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { AppTopbar } from "@/components/app-topbar";
import {
  DailyReportSkeleton,
  DailyReportView,
} from "@/components/reports/daily-report";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import { useDailyReport } from "@/hooks/use-reports";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Daily Report — ImperioBed" }] }),
  component: ReportsPage,
});

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function ReportsPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const [date, setDate] = useState<Date>(today);

  const {
    data: report,
    isLoading,
    isError,
    error,
  } = useDailyReport(activeHotelId ?? "", date);

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Daily Operations Report">
        <DatePicker date={date} onDateChange={setDate} />
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="size-4" />
          Print
        </Button>
      </AppTopbar>

      <div className="p-4 lg:p-6 print:p-0">
        <div className="mb-6 hidden print:block">
          <h1 className="text-xl font-bold">Daily Operations Report</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {isLoading ? (
          <DailyReportSkeleton />
        ) : isError ? (
          <p className="text-sm text-destructive">{error?.message}</p>
        ) : report ? (
          <DailyReportView report={report} />
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
