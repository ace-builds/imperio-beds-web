import type { Role } from '@/lib/schemas/hotel'

export function canAccess(role: Role | undefined, requiredRoles: Role[] | 'any'): boolean {
  if (!role) return false
  return requiredRoles === 'any' || requiredRoles.includes(role)
}

export type NavItem = {
  label: string
  to: string
  roles: Role[] | 'any'
}

// Phase 2+ adds more entries as their modules ship — this is infrastructure,
// not a security boundary: the server's HotelAccessGuard is what actually
// enforces access, this just keeps the nav from showing links a role can't use.
export const NAV_ITEMS: NavItem[] = [{ label: 'Hotels', to: '/hotels', roles: ['owner_admin'] }]
