import { createFileRoute } from '@tanstack/react-router'
import { LineChart } from 'lucide-react'
import { AppTopbar } from '@/components/app-topbar'
import { ComingSoon } from '@/components/coming-soon'

export const Route = createFileRoute('/_authenticated/reports')({
  component: ReportsPage,
})

function ReportsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Reports" />
      <ComingSoon
        icon={LineChart}
        title="Reports"
        description="Daily operations reporting lands in Phase 5."
      />
    </div>
  )
}
