import { createFileRoute } from '@tanstack/react-router'
import { Calendar } from 'lucide-react'
import { AppTopbar } from '@/components/app-topbar'
import { ComingSoon } from '@/components/coming-soon'

export const Route = createFileRoute('/_authenticated/front-desk')({
  component: FrontDeskPage,
})

function FrontDeskPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Front Desk" />
      <ComingSoon
        icon={Calendar}
        title="Front Desk"
        description="Check-in, check-out, and stay management land in Phase 3."
      />
    </div>
  )
}
