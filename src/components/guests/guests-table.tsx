import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GuestDetailSheet } from "@/components/guests/guest-detail-sheet";
import { GuestFormDialog } from "@/components/guests/guest-form-dialog";
import { GuestStatusBadge } from "@/components/guests/guest-status-badge";
import {
  useGuest,
  useGuestsWithStats,
  type GuestWithStats,
} from "@/hooks/use-guests";
import type { Guest } from "@/lib/schemas/guest";

const PAGE_SIZE = 10;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// The latest guest note is only fetched for guests on the visible page (see
// GuestsTable below) rather than the whole list — there's no batch
// "latest note per guest" endpoint, and GET /guests/:id already returns
// notes desc by createdAt, so this is one small REST call per visible row.
function GuestSubtitle({
  hotelId,
  guestId,
}: {
  hotelId: string;
  guestId: string;
}) {
  const { data } = useGuest(hotelId, guestId);
  const latestNote = data?.notes[0];
  if (!latestNote) return null;
  return (
    <p className="max-w-56 truncate text-xs text-muted-foreground">
      {latestNote.body}
    </p>
  );
}

export function GuestsTable({
  hotelId,
  canManage,
}: {
  hotelId: string;
  canManage: boolean;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | undefined>();
  const [viewingGuestId, setViewingGuestId] = useState<string | undefined>();

  const { data: guests, isLoading } = useGuestsWithStats(
    hotelId,
    search || undefined,
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  const total = guests?.length ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const pageRows = (guests ?? []).slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or phone…"
            className="w-72 pl-8"
          />
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus data-icon="inline-start" />
          Add New Guest
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Total Stays</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && pageRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No guests match.
                </TableCell>
              </TableRow>
            )}
            {pageRows.map((guest: GuestWithStats) => (
              <TableRow key={guest.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials(guest.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{guest.name}</span>
                      <GuestSubtitle hotelId={hotelId} guestId={guest.id} />
                    </div>
                  </div>
                </TableCell>
                <TableCell>{guest.phone ?? "—"}</TableCell>
                <TableCell>{guest.totalStays}</TableCell>
                <TableCell>
                  {guest.lastVisit
                    ? new Date(guest.lastVisit).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </TableCell>
                <TableCell>
                  <GuestStatusBadge status={guest.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="View guest"
                    onClick={() => setViewingGuestId(guest.id)}
                  >
                    <Eye />
                  </Button>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit guest"
                      onClick={() => {
                        setEditing(guest);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {rangeStart} to {rangeEnd} of {total} guests
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= lastPage}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <GuestFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        hotelId={hotelId}
        guest={editing}
      />

      <GuestDetailSheet
        open={!!viewingGuestId}
        onOpenChange={(open) => !open && setViewingGuestId(undefined)}
        hotelId={hotelId}
        guestId={viewingGuestId}
      />
    </div>
  );
}
