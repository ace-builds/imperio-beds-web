import { createFileRoute } from '@tanstack/react-router'
import { Package } from 'lucide-react'
import { AppTopbar } from '@/components/app-topbar'
import { ComingSoon } from '@/components/coming-soon'

export const Route = createFileRoute('/_authenticated/inventory')({
  component: InventoryPage,
})

function InventoryPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Inventory" />
      <ComingSoon
        icon={Package}
        title="Inventory"
        description="Stock tracking and stock-in/stock-out forms land in Phase 4."
      />
    </div>
  )
}
