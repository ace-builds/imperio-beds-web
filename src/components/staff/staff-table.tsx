import { useMemo, useState } from 'react'
import {
  LogIn,
  LogOut,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserPen,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ROLE_INFO, type InvitableRole } from '@/components/onboarding/constants'
import { AddStaffDialog } from '@/components/staff/add-staff-dialog'
import { EditStaffDialog } from '@/components/staff/edit-staff-dialog'
import { StaffShiftBadge, StaffStatusBadge } from '@/components/staff/staff-badges'
import { StaffStats } from '@/components/staff/staff-stats'
import { useCancelInvite, useHotelStaff, useRemoveStaff, useSetStaffOnDuty, useUpdateStaff } from '@/hooks/use-hotels'
import { formatLastActive } from '@/lib/format'
import type { HotelStaffWithUser } from '@/lib/schemas/hotel'

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function StaffTable({ hotelId, canManage }: { hotelId: string; canManage: boolean }) {
  const { data, isLoading } = useHotelStaff(hotelId)
  const setOnDuty = useSetStaffOnDuty(hotelId)
  const updateStaff = useUpdateStaff(hotelId)
  const removeStaff = useRemoveStaff(hotelId)
  const cancelInvite = useCancelInvite(hotelId)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<InvitableRole | 'all'>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<HotelStaffWithUser | undefined>()
  const [removing, setRemoving] = useState<HotelStaffWithUser | null>(null)
  const [cancelling, setCancelling] = useState<{ id: string; email: string } | null>(null)

  const staff = data?.staff ?? []
  const invites = data?.invites ?? []

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (data?.staff ?? []).filter((member) => {
      const matchesRole = roleFilter === 'all' || member.role === roleFilter
      const matchesQuery =
        !query ||
        member.user.name.toLowerCase().includes(query) ||
        member.user.email.toLowerCase().includes(query) ||
        (member.phone ?? '').toLowerCase().includes(query)
      return matchesRole && matchesQuery
    })
  }, [data, search, roleFilter])

  const filteredInvites = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (data?.invites ?? []).filter((invite) => {
      const matchesRole = roleFilter === 'all' || invite.role === roleFilter
      const matchesQuery = !query || invite.email.toLowerCase().includes(query)
      return matchesRole && matchesQuery
    })
  }, [data, search, roleFilter])

  const isEmpty = !isLoading && filteredStaff.length === 0 && filteredInvites.length === 0

  return (
    <div className="flex flex-col gap-4">
      <StaffStats staff={staff} invites={invites} />

      <Card className="gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <h2 className="font-heading text-base font-medium">All Staff</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search staff name or email…"
                className="w-64 pl-8"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as InvitableRole | 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Roles</SelectItem>
                  {(Object.keys(ROLE_INFO) as InvitableRole[]).map((roleOption) => (
                    <SelectItem key={roleOption} value={roleOption}>
                      {ROLE_INFO[roleOption].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {canManage && (
              <Button onClick={() => setAddOpen(true)}>
                <Plus data-icon="inline-start" />
                Add Staff Member
              </Button>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Role / Department</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead>Shift Status</TableHead>
              <TableHead>Last Active</TableHead>
              {canManage && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}

            {isEmpty && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Empty className="border-none py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Users />
                      </EmptyMedia>
                      <EmptyTitle>No staff yet</EmptyTitle>
                      <EmptyDescription>
                        {canManage
                          ? 'Add your first staff member to get started.'
                          : 'No staff match your search.'}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}

            {filteredStaff.map((member) => {
              const roleInfo = ROLE_INFO[member.role as InvitableRole]
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.user.image ?? undefined} alt={member.user.name} />
                        <AvatarFallback>{initials(member.user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{member.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {member.phone ?? member.user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleInfo.badgeVariant}>{roleInfo.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <StaffStatusBadge status={member.status} />
                  </TableCell>
                  <TableCell>
                    <StaffShiftBadge status={member.status} onDuty={member.onDuty} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatLastActive(member.lastActiveAt)}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={member.onDuty ? 'Clock out' : 'Clock in'}
                          disabled={member.status === 'suspended' || setOnDuty.isPending}
                          onClick={() =>
                            setOnDuty.mutate({ staffId: member.id, onDuty: !member.onDuty })
                          }
                        >
                          {member.onDuty ? <LogOut /> : <LogIn />}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="More actions">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditing(member)}>
                              <UserPen data-icon="inline-start" />
                              Edit Details
                            </DropdownMenuItem>
                            {member.status === 'active' ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStaff.mutate({
                                    staffId: member.id,
                                    input: { status: 'suspended' },
                                  })
                                }
                              >
                                <ShieldOff data-icon="inline-start" />
                                Suspend Access
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStaff.mutate({
                                    staffId: member.id,
                                    input: { status: 'active' },
                                  })
                                }
                              >
                                <ShieldCheck data-icon="inline-start" />
                                Reactivate Access
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem variant="destructive" onClick={() => setRemoving(member)}>
                              <Trash2 data-icon="inline-start" />
                              Remove from Hotel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}

            {filteredInvites.map((invite) => {
              const roleInfo = ROLE_INFO[invite.role as InvitableRole]
              return (
                <TableRow key={invite.id} className="bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          <Mail className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{invite.email}</span>
                        <span className="text-xs text-muted-foreground">
                          Invited {formatLastActive(invite.createdAt)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleInfo.badgeVariant}>{roleInfo.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning">Pending Invite</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">–</TableCell>
                  <TableCell className="text-muted-foreground">–</TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Cancel invite"
                        onClick={() => setCancelling({ id: invite.id, email: invite.email })}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      <AddStaffDialog open={addOpen} onOpenChange={setAddOpen} hotelId={hotelId} />

      <EditStaffDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(undefined)}
        hotelId={hotelId}
        staff={editing}
      />

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove staff member"
        description={`Remove "${removing?.user.name}" from this hotel? They'll immediately lose access.`}
        confirmLabel="Remove"
        destructive
        pending={removeStaff.isPending}
        error={removeStaff.error?.message}
        onConfirm={() => {
          if (!removing) return
          removeStaff.mutate(removing.id, { onSuccess: () => setRemoving(null) })
        }}
      />

      <ConfirmDialog
        open={!!cancelling}
        onOpenChange={(open) => !open && setCancelling(null)}
        title="Cancel invite"
        description={`Cancel the pending invite for "${cancelling?.email}"?`}
        confirmLabel="Cancel Invite"
        destructive
        pending={cancelInvite.isPending}
        error={cancelInvite.error?.message}
        onConfirm={() => {
          if (!cancelling) return
          cancelInvite.mutate(cancelling.id, { onSuccess: () => setCancelling(null) })
        }}
      />
    </div>
  )
}
