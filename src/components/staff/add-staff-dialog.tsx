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
import { useCreateInvite } from '@/hooks/use-hotels'

export function AddStaffDialog({
  open,
  onOpenChange,
  hotelId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InvitableRole | ''>('')

  const createInvite = useCreateInvite(hotelId)

  useEffect(() => {
    if (!open) return
    setEmail('')
    setRole('')
  }, [open])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!role) return
    createInvite.mutate(
      { email, role },
      {
        onSuccess: () => onOpenChange(false),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
          <DialogDescription>
            They'll receive an email invite to set up their login. Staff profiles are created once
            the invite is accepted.
          </DialogDescription>
        </DialogHeader>
        <form id="add-staff-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="staff-email">Email Address</FieldLabel>
              <Input
                id="staff-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="staff@yourhotel.com"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="staff-role">Role</FieldLabel>
              <Select value={role} onValueChange={(value) => setRole(value as InvitableRole)}>
                <SelectTrigger id="staff-role" className="w-full">
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
          </FieldGroup>
        </form>
        {createInvite.isError && (
          <p className="text-sm text-destructive">{createInvite.error.message}</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="add-staff-form" disabled={createInvite.isPending || !role}>
            {createInvite.isPending ? 'Sending…' : 'Send Invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
