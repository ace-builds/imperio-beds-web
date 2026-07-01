import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Download, Send } from "lucide-react";
import { AppTopbar } from "@/components/app-topbar";
import { Button } from "@/components/ui/button";
import { PayrollStats } from "@/components/payroll/payroll-stats";
import { PayrollTable } from "@/components/payroll/payroll-table";
import { useActiveHotelRole } from "@/hooks/use-active-hotel-role";
import { useActiveHotel } from "@/hooks/use-hotels";
import { usePayroll, useRunPayroll } from "@/hooks/use-payroll";
import { downloadCsv } from "@/lib/csv";
import { useCurrentHotelStore } from "@/stores/current-hotel";

export const Route = createFileRoute("/_authenticated/payroll")({
  head: () => ({ meta: [{ title: "Payroll — ImperioBed" }] }),
  component: PayrollPage,
});

function PayrollPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const { role } = useActiveHotelRole();
  const { hotel } = useActiveHotel();
  const canManage = role === "owner_admin" || role === "accountant";

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const period = format(month, "yyyy-MM");

  const { data: rows, isLoading } = usePayroll(activeHotelId ?? "", period);
  const runPayroll = useRunPayroll(activeHotelId ?? "", period);

  const eligibleCount = useMemo(
    () => (rows ?? []).filter((row) => row.baseSalary !== null && !row.entry).length,
    [rows],
  );

  if (!activeHotelId) return null;

  function exportReport() {
    const header = [
      "Staff Member",
      "Role",
      "Base Salary",
      "Additions",
      "Deductions",
      "Net Payable",
      "Payment Status",
    ];
    const body = (rows ?? []).map((row) => [
      row.name,
      row.role,
      row.baseSalary ?? "",
      row.entry?.additions ?? "",
      row.entry?.deductions ?? "",
      row.entry?.netPayable ?? "",
      row.entry?.status ?? "not_run",
    ]);
    downloadCsv(`payroll-${period}.csv`, [header, ...body]);
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Payroll Management" />
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-md border bg-background p-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Previous month"
              onClick={() => setMonth((current) => subMonths(current, 1))}
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-32 text-center text-sm font-medium">
              {format(month, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Next month"
              onClick={() => setMonth((current) => addMonths(current, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportReport} disabled={!rows?.length}>
              <Download data-icon="inline-start" />
              Export Report
            </Button>
            {canManage && (
              <Button onClick={() => runPayroll.mutate()} disabled={runPayroll.isPending}>
                <Send data-icon="inline-start" />
                {runPayroll.isPending
                  ? "Running…"
                  : eligibleCount > 0
                    ? `Run Payroll (${eligibleCount})`
                    : "Run Payroll"}
              </Button>
            )}
          </div>
        </div>

        {runPayroll.isError && (
          <p className="text-sm text-destructive">{runPayroll.error.message}</p>
        )}

        <PayrollStats rows={rows ?? []} currency={hotel?.currency} />

        <PayrollTable
          hotelId={activeHotelId}
          period={period}
          rows={rows ?? []}
          isLoading={isLoading}
          currency={hotel?.currency}
          canManage={canManage}
        />
      </div>
    </div>
  );
}
