import { useEffect } from 'react'
import { createFileRoute, Outlet, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useHotelReplication } from '@/hooks/use-hotel-replication'
import { useMyHotelAccess } from '@/hooks/use-hotel-access'
import { resolveSession } from '@/lib/session'
import { socket } from '@/lib/socket'
import { useCurrentHotelStore } from '@/stores/current-hotel'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    // resolveSession falls back to the last known session when the API is
    // unreachable, so a reboot with no network opens the app against RxDB
    // instead of bouncing to a login screen that can't be submitted either.
    const resolved = await resolveSession()
    if (!resolved) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return resolved
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const router = useRouter()
  const { isOffline } = Route.useRouteContext()
  const { data: hotelAccess, isLoading: isHotelAccessLoading } = useMyHotelAccess()
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId)
  const setActiveHotelId = useCurrentHotelStore((state) => state.setActiveHotelId)

  useHotelReplication(activeHotelId)

  const hasNoHotelAccess = !isHotelAccessLoading && hotelAccess?.length === 0

  // We're running on an unverified cached session — re-check it (by re-running
  // beforeLoad) as soon as the server is reachable again, so someone whose
  // access was revoked while offline doesn't stay in the shell indefinitely.
  // Both triggers matter: `online` covers a machine that had no network at
  // all, the socket covers the API itself having been down.
  useEffect(() => {
    if (!isOffline) return

    function revalidate() {
      void router.invalidate()
    }
    window.addEventListener('online', revalidate)
    socket.on('connect', revalidate)
    return () => {
      window.removeEventListener('online', revalidate)
      socket.off('connect', revalidate)
    }
  }, [isOffline, router])

  // Default to the first available hotel once we know what the user can
  // access (most users only have one), and drop a persisted hotel they no
  // longer have access to. Skipped while offline, when an empty/failed
  // hotel-access response says nothing about what's still valid.
  useEffect(() => {
    if (!hotelAccess || hotelAccess.length === 0) return
    if (activeHotelId && hotelAccess.some((item) => item.hotelId === activeHotelId)) return
    setActiveHotelId(hotelAccess[0].hotelId)
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
