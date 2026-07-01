import {
  BedDouble,
  Building2,
  Calendar,
  CalendarRange,
  History,
  LayoutGrid,
  LineChart,
  Package,
  Settings,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Role } from '@/lib/schemas/hotel'

export function canAccess(role: Role | undefined, requiredRoles: Role[] | 'any'): boolean {
  if (requiredRoles === 'any') return true
  if (!role) return false
  return requiredRoles.includes(role)
}

export type NavSection = 'main' | 'operations' | 'admin'

export type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  section: NavSection
  roles: Role[] | 'any'
}

// Phase 2+ adds more entries as their modules ship — this is infrastructure,
// not a security boundary: the server's HotelAccessGuard is what actually
// enforces access, this just keeps the nav from showing links a role can't use.
// Payroll is still deferred post-MVP (see root CLAUDE.md) — it renders as a
// static nav entry ahead of its module actually existing. Staff shipped: its
// roles are 'owner_admin' only because every /hotels/:id/staff/* route is
// gated to the literal hotel owner (see HotelsController) — not the wider
// manager access some other modules allow.
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutGrid, section: 'main', roles: 'any' },
  {
    label: 'Front Desk',
    to: '/front-desk',
    icon: Calendar,
    section: 'main',
    roles: ['owner_admin', 'manager', 'front_desk'],
  },
  { label: 'Rooms', to: '/rooms', icon: BedDouble, section: 'main', roles: 'any' },
  {
    label: 'Guests',
    to: '/guests',
    icon: Users,
    section: 'main',
    roles: ['owner_admin', 'manager', 'front_desk'],
  },
  {
    label: 'Calendar',
    to: '/calendar',
    icon: CalendarRange,
    section: 'main',
    roles: ['owner_admin', 'manager', 'front_desk'],
  },
  {
    label: 'Inventory',
    to: '/inventory',
    icon: Package,
    section: 'operations',
    roles: ['owner_admin', 'manager', 'storekeeper'],
  },
  {
    label: 'Staff',
    to: '/staff',
    icon: UserRound,
    section: 'operations',
    roles: ['owner_admin'],
  },
  {
    label: 'Payroll',
    to: '/payroll',
    icon: Wallet,
    section: 'operations',
    roles: ['owner_admin', 'accountant'],
  },
  {
    label: 'Reports',
    to: '/reports',
    icon: LineChart,
    section: 'admin',
    roles: ['owner_admin', 'manager', 'accountant'],
  },
  { label: 'Hotels', to: '/hotels', icon: Building2, section: 'admin', roles: ['owner_admin'] },
  {
    label: 'Audit Log',
    to: '/audit-logs',
    icon: History,
    section: 'admin',
    roles: ['owner_admin'],
  },
  { label: 'Settings', to: '/settings', icon: Settings, section: 'admin', roles: ['owner_admin'] },
]
