import {
  AlertTriangle,
  ArrowRightToLine,
  ArrowLeftFromLine,
  Banknote,
  ClipboardList,
  Home,
  PackageMinus,
  Sparkles,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react'
import type { ActivityEntry, ArrivalEntry, RoomStatusSegment, StaffShiftEntry, StatTrend } from '@/components/dashboard/types'

// Placeholder data — rooms/guests/staff/activity collections don't exist yet
// (Phase 2+ in todo.md). Swap this module out for real RxDB/query data once
// those collections land; the dashboard components only depend on the types
// in ./types, not on this mock shape.

export const STATS: { label: string; value: string; icon: typeof Wallet; trend: StatTrend }[] = [
  {
    label: 'Revenue Today',
    value: '$2,840',
    icon: Wallet,
    trend: { label: '+12% vs yesterday', tone: 'success', icon: TrendingUp },
  },
  {
    label: 'Occupancy',
    value: '82%',
    icon: Home,
    trend: { label: '24 / 29 Rooms', tone: 'muted' },
  },
  {
    label: 'Check-ins Today',
    value: '8',
    icon: UserPlus,
    trend: { label: '3 Pending Arrival', tone: 'success' },
  },
  {
    label: 'Pending Tasks',
    value: '4',
    icon: ClipboardList,
    trend: { label: '2 Maintenance', tone: 'destructive' },
  },
]

export const ROOM_STATUS_SEGMENTS: RoomStatusSegment[] = [
  { label: 'Occupied', count: 19, tone: 'destructive' },
  { label: 'Available', count: 6, tone: 'success' },
  { label: 'Cleaning', count: 3, tone: 'warning' },
  { label: 'Maintenance', count: 1, tone: 'info' },
]

export const ARRIVALS: ArrivalEntry[] = [
  { id: 'arr-1', guestName: 'John Doe', roomType: 'Deluxe Room', nights: 3, checkedIn: false },
  { id: 'arr-2', guestName: 'Amina S.', roomType: 'Standard Room', nights: 1, checkedIn: false },
]

export const MORNING_SHIFT: StaffShiftEntry[] = [
  { id: 'staff-1', name: 'Grace Okafor', role: 'Front Desk', time: '07:55 AM', late: false },
  { id: 'staff-2', name: 'Emmanuel K.', role: 'Housekeeping', time: '08:02 AM', late: false },
  { id: 'staff-3', name: 'Chidinma B.', role: 'Kitchen', time: '08:00 AM', late: false },
  { id: 'staff-4', name: 'Samuel T.', role: 'Security', time: '08:45 AM', late: true },
]

export const ACTIVITY_FEED: ActivityEntry[] = [
  { id: 'act-1', icon: ArrowRightToLine, tone: 'info', title: 'Check-in: Room 104', actor: 'Grace O.', timeAgo: '10 mins ago' },
  { id: 'act-2', icon: PackageMinus, tone: 'warning', title: 'Stock Out: 4 Towels', actor: 'Emmanuel K.', timeAgo: '25 mins ago' },
  { id: 'act-3', icon: AlertTriangle, tone: 'destructive', title: 'Maintenance: AC Issue', actor: 'Reported by Guest', timeAgo: '1 hr ago' },
  { id: 'act-4', icon: Banknote, tone: 'success', title: 'Payment: $120 (POS)', actor: 'Grace O.', timeAgo: '1 hr ago' },
  { id: 'act-5', icon: Sparkles, tone: 'success', title: 'Room 201 Cleaned', actor: 'Chidinma B.', timeAgo: '2 hrs ago' },
  { id: 'act-6', icon: ArrowLeftFromLine, tone: 'muted', title: 'Check-out: Room 305', actor: 'Grace O.', timeAgo: '2 hrs ago' },
]
