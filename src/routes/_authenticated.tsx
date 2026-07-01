import { useEffect } from 'react'
import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useHotelReplication } from '@/hooks/use-hotel-replication'
import { useMyHotelAccess } from '@/hooks/use-hotel-access'
import { authClient } from '@/lib/auth-client'
import { useCurrentHotelStore } from '@/stores/current-hotel'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { data: session } = await authClient.getSession()
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { session }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const { data: hotelAccess, isLoading: isHotelAccessLoading } = useMyHotelAccess()
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId)
  const setActiveHotelId = useCurrentHotelStore((state) => state.setActiveHotelId)

  useHotelReplication(activeHotelId)

  const hasNoHotelAccess = !isHotelAccessLoading && hotelAccess?.length === 0

  // Nothing else ever sets activeHotelId — default to the first available
  // hotel once we know what the user can access (most users only have one).
  useEffect(() => {
    if (!activeHotelId && hotelAccess && hotelAccess.length > 0) {
      setActiveHotelId(hotelAccess[0].hotelId)
    }
  }, [activeHotelId, hotelAccess, setActiveHotelId])

  // A user with zero hotel access (brand-new owner, or an invite that never
  // landed) has nothing to do in the app shell — send them to set up their
  // first hotel instead of rendering an empty dashboard.
  useEffect(() => {
    if (hasNoHotelAccess) {
      navigate({ to: '/onboarding' })
    }
  }, [hasNoHotelAccess, navigate])

  if (hasNoHotelAccess) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
