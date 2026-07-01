import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useAddGuestNote, useGuest } from '@/hooks/use-guests'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function GuestDetailSheet({
  open,
  onOpenChange,
  hotelId,
  guestId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  guestId: string | undefined
}) {
  const { data: guest, isLoading } = useGuest(hotelId, guestId)
  const addNote = useAddGuestNote(hotelId)
  const [noteBody, setNoteBody] = useState('')

  function submitNote() {
    if (!guestId || !noteBody.trim()) return
    addNote.mutate(
      { guestId, body: noteBody.trim() },
      { onSuccess: () => setNoteBody('') },
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setNoteBody('')
        onOpenChange(next)
      }}
    >
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center gap-3">
            {guest && (
              <Avatar size="lg">
                <AvatarFallback>{initials(guest.name)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <SheetTitle>{guest?.name ?? 'Guest'}</SheetTitle>
              <SheetDescription>{guest?.phone ?? ''}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {isLoading && <p className="px-4 text-sm text-muted-foreground">Loading…</p>}

        {guest && (
          <div className="flex flex-col gap-4 px-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total Stays</p>
                <p className="font-medium">{guest.stays.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{guest.email ?? '—'}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Stay History</p>
              {guest.stays.length === 0 && (
                <p className="text-sm text-muted-foreground">No stays recorded yet.</p>
              )}
              <div className="flex flex-col gap-2">
                {guest.stays.map((stay) => (
                  <div key={stay.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Room {stay.room.number} — {new Date(stay.checkInAt).toLocaleDateString()}
                    </span>
                    <Badge variant={stay.status === 'active' ? 'success' : 'secondary'}>
                      {stay.status === 'active' ? 'Checked In' : 'Checked Out'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Notes</p>
              {guest.notes.length === 0 && (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              )}
              <div className="flex flex-col gap-2">
                {guest.notes.map((note) => (
                  <p key={note.id} className="text-sm text-muted-foreground">
                    {note.body}
                  </p>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <Textarea
                  value={noteBody}
                  onChange={(event) => setNoteBody(event.target.value)}
                  placeholder="Add a note — VIP, issues, preferences…"
                />
                <Button
                  size="sm"
                  className="self-end"
                  disabled={!noteBody.trim() || addNote.isPending}
                  onClick={submitNote}
                >
                  {addNote.isPending ? 'Adding…' : 'Add Note'}
                </Button>
              </div>
              {addNote.isError && (
                <p className="mt-1 text-sm text-destructive">{addNote.error.message}</p>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
