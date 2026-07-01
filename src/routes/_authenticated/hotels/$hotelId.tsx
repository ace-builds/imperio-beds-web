import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCancelInvite,
  useCreateInvite,
  useHotelStaff,
  useRemoveStaff,
} from "@/hooks/use-hotels";
import { invitableRoleSchema } from "@/lib/schemas/hotel";

export const Route = createFileRoute("/_authenticated/hotels/$hotelId")({
  head: () => ({ meta: [{ title: "Staff & Invites — ImperioBed" }] }),
  component: HotelDetailPage,
});

const INVITABLE_ROLES = invitableRoleSchema.options;

function HotelDetailPage() {
  const { hotelId } = Route.useParams();
  const { data, isLoading } = useHotelStaff(hotelId);
  const removeStaff = useRemoveStaff(hotelId);
  const cancelInvite = useCancelInvite(hotelId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Staff &amp; invites</h1>

      <InviteStaffForm hotelId={hotelId} />

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {data && data.staff.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Current staff
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.staff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={removeStaff.isPending}
                      onClick={() => removeStaff.mutate(staff.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      {data && data.invites.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Pending invites
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>{invite.email}</TableCell>
                  <TableCell>{invite.role}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cancelInvite.isPending}
                      onClick={() => cancelInvite.mutate(invite.id)}
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}

function InviteStaffForm({ hotelId }: { hotelId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof INVITABLE_ROLES)[number]>(
    INVITABLE_ROLES[0],
  );
  const createInvite = useCreateInvite(hotelId);

  return (
    <form
      className="flex flex-col gap-4 rounded-lg border p-4"
      onSubmit={(event) => {
        event.preventDefault();
        createInvite.mutate({ email, role }, { onSuccess: () => setEmail("") });
      }}
    >
      <h2 className="text-sm font-medium">Invite staff</h2>
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Role</Label>
          <Select
            value={role}
            onValueChange={(value) => setRole(value as typeof role)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVITABLE_ROLES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {createInvite.isError && (
        <p className="text-sm text-destructive">{createInvite.error.message}</p>
      )}
      <Button type="submit" disabled={createInvite.isPending}>
        {createInvite.isPending ? "Sending invite…" : "Send invite"}
      </Button>
    </form>
  );
}
