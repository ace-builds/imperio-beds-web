import { useEffect } from 'react'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppHeader } from '@/components/app-header'
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
  const { data: hotelAccess } = useMyHotelAccess()
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId)
  const setActiveHotelId = useCurrentHotelStore((state) => state.setActiveHotelId)

  // Nothing else ever sets activeHotelId — default to the first available
  // hotel once we know what the user can access (most users only have one).
  useEffect(() => {
    if (!activeHotelId && hotelAccess && hotelAccess.length > 0) {
      setActiveHotelId(hotelAccess[0].hotelId)
    }
  }, [activeHotelId, hotelAccess, setActiveHotelId])

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
