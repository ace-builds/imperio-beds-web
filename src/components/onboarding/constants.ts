import type { Currency, PaymentMethod, Role, TotalRoomsRange } from '@/lib/schemas/hotel'

export const TOTAL_ROOMS_OPTIONS: { value: TotalRoomsRange; label: string }[] = [
  { value: '1-20', label: '1 – 20 Rooms' },
  { value: '21-50', label: '21 – 50 Rooms' },
  { value: '51-100', label: '51 – 100 Rooms' },
  { value: '100+', label: '100+ Rooms' },
]

export const STAR_RATING_OPTIONS = [1, 2, 3, 4, 5].map((rating) => ({
  value: String(rating),
  label: `${rating}-Star`,
}))

export const CHECK_OUT_TIME_OPTIONS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
]

export const PRESET_ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Family', 'Executive']

export const CURRENCY_OPTIONS: { value: Currency; symbol: string }[] = [
  { value: 'NGN', symbol: '₦' },
  { value: 'USD', symbol: '$' },
  { value: 'GHS', symbol: 'GH₵' },
  { value: 'KES', symbol: 'KSh' },
]

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'pos', label: 'POS' },
]

export type InvitableRole = Exclude<Role, 'owner_admin'>

export const ROLE_INFO: Record<
  InvitableRole,
  { label: string; description: string; badgeVariant: 'info' | 'success' | 'warning' | 'secondary' }
> = {
  manager: {
    label: 'Manager',
    description: 'Full operations access. Can manage rooms, staff, and reports.',
    badgeVariant: 'info',
  },
  front_desk: {
    label: 'Front Desk',
    description: 'Check-in, check-out, and guest management only.',
    badgeVariant: 'success',
  },
  storekeeper: {
    label: 'Storekeeper',
    description: 'Inventory tracking, stock in/out, and usage logs.',
    badgeVariant: 'warning',
  },
  accountant: {
    label: 'Accountant',
    description: 'Payments, expenses, payroll records, and reports.',
    badgeVariant: 'secondary',
  },
  housekeeping: {
    label: 'Housekeeping',
    description: 'Room status updates and cleaning task tracking.',
    badgeVariant: 'secondary',
  },
  maintenance: {
    label: 'Maintenance',
    description: 'Room notes, repair tracking, and maintenance status.',
    badgeVariant: 'secondary',
  },
}

// Subset highlighted in the "What each role can do" grid — the most
// commonly invited office roles. Housekeeping/maintenance are still
// selectable, just not called out with their own card.
export const HIGHLIGHTED_ROLES: InvitableRole[] = ['manager', 'front_desk', 'storekeeper', 'accountant']
