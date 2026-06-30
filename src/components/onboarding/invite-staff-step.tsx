import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, ChevronLeft, Info, Mail, Plus, User, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OnboardingHeader } from '@/components/onboarding/onboarding-header'
import { HIGHLIGHTED_ROLES, ROLE_INFO, type InvitableRole } from '@/components/onboarding/constants'
import { createInvite } from '@/lib/api/hotels'
import type { Hotel } from '@/lib/schemas/hotel'

type QueuedInvite = {
  name: string
  email: string
  role: InvitableRole
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function InviteStaffStep({
  hotel,
  onBack,
  onDone,
}: {
  hotel: Hotel
  onBack: () => void
  onDone: () => void
}) {
  const queryClient = useQueryClient()

  const [queue, setQueue] = useState<QueuedInvite[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InvitableRole | ''>('')

  const sendInvites = useMutation({
    mutationFn: async () => {
      await Promise.all(
        queue.map((invite) => createInvite(hotel.id, { email: invite.email, role: invite.role })),
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotel.id, 'staff'] })
      onDone()
    },
  })

  function addToQueue(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || !email.trim() || !role) return
    setQueue((prev) => [...prev, { name: name.trim(), email: email.trim(), role }])
    setName('')
    setEmail('')
    setRole('')
  }

  function removeFromQueue(index: number) {
    setQueue((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-8">
      <OnboardingHeader
        stepNumber={3}
        totalSteps={3}
        sectionLabel="Invite Staff"
        title="Invite your staff"
        description={`Add your team members to ${hotel.name}. They'll receive an invite to set up their login.`}
      />

      {queue.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase">
            Staff Added ({queue.length})
          </h3>
          <div className="flex flex-col divide-y rounded-lg border">
            {queue.map((invite, index) => (
              <div key={`${invite.email}-${index}`} className="flex items-center gap-3 px-4 py-2.5">
                <Avatar>
                  <AvatarFallback>{initials(invite.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium">{invite.name}</span>
                  <span className="text-xs text-muted-foreground">{invite.email}</span>
                </div>
                <Badge variant={ROLE_INFO[invite.role].badgeVariant}>
                  {ROLE_INFO[invite.role].label}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${invite.name}`}
                  onClick={() => removeFromQueue(index)}
                >
                  <X />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={addToQueue}>
        <FieldSet>
          <FieldLegend variant="label">Add Another Staff Member</FieldLegend>
          <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-x-4">
            <Field>
              <FieldLabel htmlFor="invite-name">Full Name</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <User />
                </InputGroupAddon>
                <InputGroupInput
                  id="invite-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Ngozi Eze"
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <Select value={role} onValueChange={(value) => setRole(value as InvitableRole)}>
                <SelectTrigger id="invite-role" className="w-full">
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
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="invite-email">Email Address</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
                <InputGroupInput
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="staff@yourhotel.com"
                />
              </InputGroup>
            </Field>
          </FieldGroup>
        </FieldSet>

        <Button type="submit" variant="outline" className="border-dashed">
          <Plus data-icon="inline-start" />
          Add another staff member
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase">
          What Each Role Can Do
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {HIGHLIGHTED_ROLES.map((roleKey) => (
            <Card key={roleKey} size="sm">
              <CardContent>
                <p className="text-sm font-medium">{ROLE_INFO[roleKey].label}</p>
                <p className="text-sm text-muted-foreground">{ROLE_INFO[roleKey].description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Alert variant="info">
        <Info />
        <AlertDescription>
          Staff will receive an email invite to join {hotel.name}. They can only access modules
          tied to their assigned role.
        </AlertDescription>
      </Alert>

      {sendInvites.isError && (
        <p className="text-sm text-destructive">{sendInvites.error.message}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="icon" aria-label="Back" onClick={onBack}>
          <ChevronLeft />
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={sendInvites.isPending}
          onClick={() => (queue.length > 0 ? sendInvites.mutate() : onDone())}
        >
          {sendInvites.isPending ? 'Sending…' : 'Send Invites & Go Live'}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>

      <Button type="button" variant="link" className="self-center" onClick={onDone}>
        Not ready? Skip and go to dashboard
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  )
}
