import { useEffect, useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useCreateGuest, useGuests } from '@/hooks/use-guests'
import type { Guest } from '@/lib/schemas/guest'
import { cn } from '@/lib/utils'

// Search-as-you-type guest picker shared by the New Walk-in and New
// Reservation dialogs. When no guest matches the typed query, shows an
// inline form to create a new guest with name, phone (required), and email.
export function GuestPicker({
  value,
  onChange,
  hotelId,
}: {
  value: Guest | null
  onChange: (guest: Guest) => void
  hotelId: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    if (!open) {
      setShowCreateForm(false)
      setQuery('')
      setNewName('')
      setNewPhone('')
      setNewEmail('')
    }
  }, [open])

  const { data: guests, isFetching } = useGuests(hotelId, debouncedQuery || undefined)
  const createGuest = useCreateGuest(hotelId)

  function selectGuest(guest: Guest) {
    onChange(guest)
    setQuery('')
    setOpen(false)
  }

  function openCreateForm() {
    setNewName(query.trim())
    setNewPhone('')
    setNewEmail('')
    setShowCreateForm(true)
  }

  function submitCreateForm() {
    if (!newName.trim() || !newPhone.trim()) return
    createGuest.mutate(
      {
        name: newName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || undefined,
      },
      {
        onSuccess: (guest) => selectGuest(guest),
      },
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border bg-background px-3 text-left text-sm',
            !value && 'text-muted-foreground',
          )}
        >
          <Search className="size-4 shrink-0" />
          {value ? value.name : 'Search guest by name or phone…'}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        {!showCreateForm ? (
          <>
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type a name or phone number"
            />
            <div className="mt-2 flex max-h-56 flex-col gap-0.5 overflow-y-auto">
              {isFetching && (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">Searching…</p>
              )}
              {!isFetching && guests?.length === 0 && query.trim() && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  <UserPlus className="size-4 shrink-0" />
                  Add new guest "{query.trim()}"
                </button>
              )}
              {guests?.map((guest) => (
                <button
                  key={guest.id}
                  type="button"
                  onClick={() => selectGuest(guest)}
                  className="flex flex-col items-start rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  <span className="font-medium">{guest.name}</span>
                  {guest.phone && (
                    <span className="text-xs text-muted-foreground">{guest.phone}</span>
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="px-1 text-sm font-medium">New guest</p>
            <div className="flex flex-col gap-1.5">
              <label className="px-1 text-xs text-muted-foreground">Full name</label>
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="px-1 text-xs text-muted-foreground">
                Phone <span className="text-destructive">*</span>
              </label>
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                type="tel"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="px-1 text-xs text-muted-foreground">Email (optional)</label>
              <Input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="guest@example.com"
                type="email"
              />
            </div>
            {createGuest.isError && (
              <p className="px-1 text-xs text-destructive">{createGuest.error.message}</p>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowCreateForm(false)}
                disabled={createGuest.isPending}
              >
                Back
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={submitCreateForm}
                disabled={!newName.trim() || !newPhone.trim() || createGuest.isPending}
              >
                {createGuest.isPending ? 'Adding…' : 'Add guest'}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
