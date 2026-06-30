import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { HotelSwitcher } from '@/components/hotel-switcher'
import { useActiveHotelRole } from '@/hooks/use-active-hotel-role'
import { authClient } from '@/lib/auth-client'
import { canAccess, NAV_ITEMS } from '@/lib/roles'

export function AppHeader() {
  const navigate = useNavigate()
  const { role } = useActiveHotelRole()

  return (
    <header className="flex items-center justify-between gap-4 border-b px-4 py-2">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-sm font-semibold">
          imperiobeds
        </Link>
        <nav className="flex items-center gap-2">
          {NAV_ITEMS.filter((item) => canAccess(role, item.roles)).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <HotelSwitcher />
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            authClient.signOut({
              fetchOptions: { onSuccess: () => navigate({ to: '/login' }) },
            })
          }
        >
          Sign out
        </Button>
      </div>
    </header>
  )
}
