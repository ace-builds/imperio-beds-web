import { createFileRoute } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { AppTopbar } from '@/components/app-topbar'
import { ComingSoon } from '@/components/coming-soon'

export const Route = createFileRoute('/_authenticated/guests')({
  component: GuestsPage,
})

function GuestsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Guests" />
      <ComingSoon
        icon={Users}
        title="Guests"
        description="Guest search and stay history land in Phase 3."
      />
    </div>
  )
}
