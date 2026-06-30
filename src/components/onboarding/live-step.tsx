import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Hotel } from '@/lib/schemas/hotel'

export function LiveStep({ hotel }: { hotel: Hotel }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
        <PartyPopper className="size-7" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">{hotel.name} is live</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your hotel is set up and ready to go. You can manage rooms, staff, and settings anytime
          from the dashboard.
        </p>
      </div>
      <Button onClick={() => navigate({ to: '/' })}>
        Go to Dashboard
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  )
}
