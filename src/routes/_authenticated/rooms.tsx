import { createFileRoute } from '@tanstack/react-router'
import { BedDouble } from 'lucide-react'
import { AppTopbar } from '@/components/app-topbar'
import { ComingSoon } from '@/components/coming-soon'

export const Route = createFileRoute('/_authenticated/rooms')({
  component: RoomsPage,
})

function RoomsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Rooms" />
      <ComingSoon
        icon={BedDouble}
        title="Rooms"
        description="The room board and room-type management land in Phase 2."
      />
    </div>
  )
}
