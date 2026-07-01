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
import { useCreateGuest, useUpdateGuest } from '@/hooks/use-guests'
import type { Guest } from '@/lib/schemas/guest'

export function GuestFormDialog({
  open,
  onOpenChange,
  hotelId,
  guest,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  guest?: Guest
}) {
  const isEditing = !!guest

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!open) return
    setName(guest?.name ?? '')
    setPhone(guest?.phone ?? '')
    setEmail(guest?.email ?? '')
  }, [open, guest])

  const createGuest = useCreateGuest(hotelId)
  const updateGuest = useUpdateGuest(hotelId)
  const mutation = isEditing ? updateGuest : createGuest

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isEditing) {
      updateGuest.mutate(
        { guestId: guest.id, input: { name, phone, email: email || null } },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createGuest.mutate(
        { name, phone, email: email || undefined },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Guest' : 'Add New Guest'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this guest's contact details."
              : "Add a guest's contact details to start tracking their stays."}
          </DialogDescription>
        </DialogHeader>
        <form id="guest-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="guest-name">Full Name</FieldLabel>
              <Input
                id="guest-name"
                required
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
            </Field>
          </FieldGroup>
        </form>
        {mutation.isError && <p className="text-sm text-destructive">{mutation.error.message}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="guest-form" disabled={mutation.isPending || !name || !phone}>
            {mutation.isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add New Guest'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
