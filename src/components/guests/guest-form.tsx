import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { FormPage, FormPageBackLink, FormPageError, FormSection } from '@/components/form-page'
import { useCreateGuest, useUpdateGuest } from '@/hooks/use-guests'
import type { Guest } from '@/lib/schemas/guest'

export function GuestForm({ hotelId, guest }: { hotelId: string; guest?: Guest }) {
  const navigate = useNavigate()
  const isEditing = !!guest

  const [name, setName] = useState(guest?.name ?? '')
  const [phone, setPhone] = useState(guest?.phone ?? '')
  const [email, setEmail] = useState(guest?.email ?? '')

  const createGuest = useCreateGuest(hotelId)
  const updateGuest = useUpdateGuest(hotelId)
  const mutation = isEditing ? updateGuest : createGuest

  function goBack() {
    void navigate({ to: '/guests' })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isEditing) {
      updateGuest.mutate(
        { guestId: guest.id, input: { name, phone, email: email || null } },
        { onSuccess: goBack },
      )
    } else {
      createGuest.mutate({ name, phone, email: email || undefined }, { onSuccess: goBack })
    }
  }

  return (
    <FormPage
      title={isEditing ? `Edit ${guest.name}` : 'Add New Guest'}
      description={
        isEditing
          ? "Update this guest's contact details. Their stay history is unaffected."
          : "Add a guest's contact details to start tracking their stays."
      }
      backLink={<FormPageBackLink to="/guests">Guests</FormPageBackLink>}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="outline" type="button" onClick={goBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || !name.trim() || !phone.trim()}>
            {mutation.isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Guest'}
          </Button>
        </>
      }
    >
      <FormSection
        title="Contact Details"
        description="Phone is how the front desk finds a returning guest, so it's required."
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="guest-name">Full Name</FieldLabel>
            <Input
              id="guest-name"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Chioma Okeke"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="guest-phone">Phone Number</FieldLabel>
            <Input
              id="guest-phone"
              required
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+234 803 555 1234"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="guest-email">
              Email <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              id="guest-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="guest@example.com"
            />
            <FieldDescription>Used for receipts and booking confirmations.</FieldDescription>
          </Field>
        </FieldGroup>
      </FormSection>

      <FormPageError error={mutation.error?.message} />
    </FormPage>
  )
}
