import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Info, Mail } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormPage, FormPageBackLink, FormPageError, FormSection } from '@/components/form-page'
import { ROLE_INFO, type InvitableRole } from '@/components/onboarding/constants'
import { useActiveHotel, useCreateInvite } from '@/hooks/use-hotels'

export function InviteStaffForm({ hotelId }: { hotelId: string }) {
  const navigate = useNavigate()
  const { hotel } = useActiveHotel()
  const createInvite = useCreateInvite(hotelId)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InvitableRole | ''>('')

  const selectedRole = role ? ROLE_INFO[role] : null

  function goBack() {
    void navigate({ to: '/staff' })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!role) return
    createInvite.mutate({ email, role }, { onSuccess: goBack })
  }

  return (
    <FormPage
      title="Invite a Staff Member"
      description={`They'll get an email invite to set up their login for ${hotel?.name ?? 'this hotel'}. The staff profile is created once they accept.`}
      backLink={<FormPageBackLink to="/staff">Staff</FormPageBackLink>}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="outline" type="button" onClick={goBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={createInvite.isPending || !role || !email.trim()}>
            {createInvite.isPending ? 'Sending…' : 'Send Invite'}
          </Button>
        </>
      }
    >
      <FormSection title="Who To Invite" description="One invite per email address.">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="staff-email">Email Address</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Mail />
              </InputGroupAddon>
              <InputGroupInput
                id="staff-email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="staff@yourhotel.com"
              />
            </InputGroup>
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
            {/* The page has room to spell out what the picked role unlocks —
                the dialog could only show the label. */}
            <FieldDescription>
              {selectedRole?.description ?? 'The role decides which modules they can open.'}
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FormSection>

      <Alert variant="info">
        <Info />
        <AlertDescription>
          Invites expire if they aren't accepted. You can cancel a pending invite from the staff
          list at any time.
        </AlertDescription>
      </Alert>

      <FormPageError error={createInvite.error?.message} />
    </FormPage>
  )
}
