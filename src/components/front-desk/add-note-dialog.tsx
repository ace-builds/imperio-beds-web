import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function AddNoteDialog({
  open,
  onOpenChange,
  title,
  description,
  pending,
  error,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  pending: boolean
  error?: string | null
  onSubmit: (body: string) => void
}) {
  const [body, setBody] = useState('')

  useEffect(() => {
    if (open) setBody('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Textarea
          autoFocus
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What happened?"
          rows={3}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!body.trim() || pending} onClick={() => onSubmit(body.trim())}>
            {pending ? 'Saving…' : 'Add Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
