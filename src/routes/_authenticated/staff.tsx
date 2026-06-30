import { createFileRoute } from '@tanstack/react-router'
import { UserRound } from 'lucide-react'
import { AppTopbar } from '@/components/app-topbar'
import { ComingSoon } from '@/components/coming-soon'

export const Route = createFileRoute('/_authenticated/staff')({
  component: StaffPage,
})

function StaffPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Staff" />
      <ComingSoon
        icon={UserRound}
        title="Staff"
        description="Staff management is deferred post-MVP — this nav entry is a placeholder for now."
      />
    </div>
  )
}
