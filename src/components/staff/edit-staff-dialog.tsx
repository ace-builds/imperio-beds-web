import { useEffect, useState, type FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROLE_INFO, type InvitableRole } from '@/components/onboarding/constants'
import { useUpdateStaff } from '@/hooks/use-hotels'
import type { HotelStaffWithUser, StaffStatus } from '@/lib/schemas/hotel'

export function EditStaffDialog({
  open,
  onOpenChange,
  hotelId,
  staff,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  staff?: HotelStaffWithUser
}) {
  const [role, setRole] = useState<InvitableRole | ''>('')
  const [status, setStatus] = useState<StaffStatus>('active')
  const [phone, setPhone] = useState('')

  const updateStaff = useUpdateStaff(hotelId)

  useEffect(() => {
    if (!open || !staff) return
    setRole(staff.role as InvitableRole)
    setStatus(staff.status)
    setPhone(staff.phone ?? '')
  }, [open, staff])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!staff || !role) return
    updateStaff.mutate(
      {
        staffId: staff.id,
        input: { role, status, phone: phone.trim() ? phone.trim() : null },
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>
            {staff ? `Update ${staff.user.name}'s role, contact number, or access.` : ''}
          </DialogDescription>
        </DialogHeader>
        <form id="edit-staff-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="edit-staff-role">Role</FieldLabel>
              <Select value={role} onValueChange={(value) => setRole(value as InvitableRole)}>
                <SelectTrigger id="edit-staff-role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(ROLE_INFO) as InvitableRole[]).map((roleOption) => (
                      <SelectItem key={roleOption} value={roleOption}>
                        {ROLE_INFO[roleOption].label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-staff-phone">
                Phone <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="edit-staff-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0805 555 1234"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-staff-status">Access Status</FieldLabel>
              <Select value={status} onValueChange={(value) => setStatus(value as StaffStatus)}>
                <SelectTrigger id="edit-staff-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </form>
        {updateStaff.isError && (
          <p className="text-sm text-destructive">{updateStaff.error.message}</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="edit-staff-form" disabled={updateStaff.isPending || !role}>
            {updateStaff.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
