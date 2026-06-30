import { createFileRoute } from '@tanstack/react-router'
import { Wallet } from 'lucide-react'
import { AppTopbar } from '@/components/app-topbar'
import { ComingSoon } from '@/components/coming-soon'

export const Route = createFileRoute('/_authenticated/payroll')({
  component: PayrollPage,
})

function PayrollPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Payroll" />
      <ComingSoon
        icon={Wallet}
        title="Payroll"
        description="Payroll & salary management is deferred post-MVP — this nav entry is a placeholder for now."
      />
    </div>
  )
}
