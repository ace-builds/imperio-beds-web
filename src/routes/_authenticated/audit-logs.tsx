import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/app-topbar";
import { AuditLogFiltersBar } from "@/components/audit-logs/audit-log-filters";
import { AuditLogTable } from "@/components/audit-logs/audit-log-table";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import { useCurrentHotelStore } from "@/stores/current-hotel";
import type { AuditLogFilters } from "@/lib/schemas/audit-log";

export const Route = createFileRoute("/_authenticated/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Log — ImperioBed" }] }),
  component: AuditLogsPage,
});

// Owner-only per implementation.md's Phase 6 — like Hotels/Settings
// elsewhere in this app, enforcement is server-side (HotelAccessGuard
// restricts GET /hotels/:hotelId/audit-logs to owner_admin) and the nav
// entry (src/lib/roles.tsx) hides this link from other roles; no
// client-side role check here, matching that existing pattern.
function AuditLogsPage() {
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId);
  const [filters, setFilters] = useState<AuditLogFilters>({ page: 1 });

  const { data, isLoading, isError, error } = useAuditLogs(
    activeHotelId ?? "",
    filters,
  );

  if (!activeHotelId) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Audit Log" />
      <div className="flex flex-col gap-4 p-4 lg:p-6">
        <AuditLogFiltersBar filters={filters} onChange={setFilters} />

        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {isError && <p className="text-destructive">{error?.message}</p>}
        {data && (
          <AuditLogTable
            logs={data.data}
            total={data.total}
            page={data.page}
            pageSize={data.pageSize}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        )}
      </div>
    </div>
  );
}
