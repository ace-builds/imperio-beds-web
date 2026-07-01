import { useEffect, useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useCreateGuest, useGuests } from '@/hooks/use-guests'
import type { Guest } from '@/lib/schemas/guest'
import { cn } from '@/lib/utils'

// Search-as-you-type guest picker shared by the New Walk-in and New
// Reservation dialogs. Falls back to creating a new guest inline when the
// typed name has no match — there's no separate "create guest" screen yet.
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

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(timeout)
  }, [query])

  const { data: guests, isFetching } = useGuests(hotelId, debouncedQuery || undefined)
  const createGuest = useCreateGuest(hotelId)

  function selectGuest(guest: Guest) {
    onChange(guest)
    setQuery('')
    setOpen(false)
  }

  function createAndSelect() {
    const name = query.trim()
    if (!name) return
    createGuest.mutate(
      { name },
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
        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a name or phone number"
        />
        <div className="mt-2 flex max-h-56 flex-col gap-0.5 overflow-y-auto">
          {isFetching && <p className="px-2 py-1.5 text-sm text-muted-foreground">Searching…</p>}
          {!isFetching && guests?.length === 0 && query.trim() && (
            <button
              type="button"
              onClick={createAndSelect}
              disabled={createGuest.isPending}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              <UserPlus className="size-4 shrink-0" />
              {createGuest.isPending ? 'Adding…' : `Add new guest "${query.trim()}"`}
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
      </PopoverContent>
    </Popover>
  )
}
