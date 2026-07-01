import { isSameDay } from 'date-fns'
import {
  AlertTriangle,
  ArrowRightToLine,
  Building,
  Home,
  Mail,
  Package,
  TrendingDown,
  TrendingUp,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { ActivityEntry, ArrivalEntry, RoomStatusSegment, StaffShiftEntry, StatTrend } from '@/components/dashboard/types'
import type { AuditLog } from '@/lib/schemas/audit-log'
import type { HotelStaffWithUser } from '@/lib/schemas/hotel'
import type { OccupancySnapshot } from '@/lib/schemas/report'
import type { ReservationWithGuestRoom } from '@/lib/schemas/reservation'
import type { RoomWithDetails } from '@/lib/schemas/room'
import type { StayWithGuestRoom } from '@/lib/schemas/stay'

export function occupancySnapshotFromRooms(rooms: RoomWithDetails[]): OccupancySnapshot {
  const counts = { available: 0, occupied: 0, cleaning: 0, maintenance: 0 }
  for (const room of rooms) {
    counts[room.status]++
  }
  const total = rooms.length
  return {
    total,
    ...counts,
    occupancyRate: total > 0 ? Math.round((counts.occupied / total) * 100) : 0,
  }
}

export function buildOccupancySegments(occupancy: OccupancySnapshot): RoomStatusSegment[] {
  return [
    { label: 'Occupied', count: occupancy.occupied, tone: 'destructive' },
    { label: 'Available', count: occupancy.available, tone: 'success' },
    { label: 'Cleaning', count: occupancy.cleaning, tone: 'warning' },
    { label: 'Maintenance', count: occupancy.maintenance, tone: 'info' },
  ]
}

export function buildOccupancyTrend(occupancy: OccupancySnapshot): StatTrend {
  return { label: `${occupancy.occupied} / ${occupancy.total} Rooms`, tone: 'muted' }
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export function buildRevenueTrend(todayTotal: number, yesterdayTotal: number): StatTrend {
  if (yesterdayTotal === 0) {
    return todayTotal === 0
      ? { label: 'No change vs yesterday', tone: 'muted' }
      : { label: 'vs $0 yesterday', tone: 'success', icon: TrendingUp }
  }
  const pctChange = Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100)
  const sign = pctChange >= 0 ? '+' : ''
  return {
    label: `${sign}${pctChange}% vs yesterday`,
    tone: pctChange >= 0 ? 'success' : 'destructive',
    icon: pctChange >= 0 ? TrendingUp : TrendingDown,
  }
}

export function countStaysCheckedInOn(stays: StayWithGuestRoom[], date: Date) {
  return stays.filter((stay) => isSameDay(stay.checkInAt, date)).length
}

export function buildCheckInsTrend(pendingArrivals: number | null): StatTrend {
  if (pendingArrivals === null) return { label: 'Since midnight', tone: 'muted' }
  return { label: `${pendingArrivals} Pending Arrival${pendingArrivals === 1 ? '' : 's'}`, tone: 'success' }
}

export function buildPendingTasksStat(occupancy: OccupancySnapshot, lowStockCount: number | null) {
  const roomTasks = occupancy.cleaning + occupancy.maintenance
  const value = lowStockCount === null ? roomTasks : roomTasks + lowStockCount
  const trend: StatTrend = { label: `${occupancy.maintenance} Maintenance`, tone: 'destructive' }
  return { value, trend }
}

export function pendingArrivalsForDate(reservations: ReservationWithGuestRoom[], date: Date) {
  return reservations.filter(
    (reservation) => reservation.status === 'pending' && isSameDay(reservation.expectedCheckInAt, date),
  )
}

export function buildArrivals(
  reservations: ReservationWithGuestRoom[],
  roomTypeNameByRoomId: Map<string, string>,
): ArrivalEntry[] {
  const MS_PER_NIGHT = 24 * 60 * 60 * 1000
  return reservations.map((reservation) => ({
    id: reservation.id,
    guestName: reservation.guest.name,
    roomType: roomTypeNameByRoomId.get(reservation.roomId) ?? reservation.room.number,
    nights: Math.max(
      1,
      Math.ceil(
        (reservation.expectedCheckOutAt.getTime() - reservation.expectedCheckInAt.getTime()) / MS_PER_NIGHT,
      ),
    ),
    checkedIn: false,
  }))
}

export function buildStaffShift(staff: HotelStaffWithUser[]): StaffShiftEntry[] {
  return staff
    .filter((member) => member.status === 'active')
    .sort((a, b) => Number(b.onDuty) - Number(a.onDuty))
    .map((member) => ({
      id: member.id,
      name: member.user.name,
      role: member.role,
      avatarUrl: member.user.image ?? undefined,
      onDuty: member.onDuty,
      lastActiveAt: member.lastActiveAt,
    }))
}

const ENTITY_ICON: Record<string, LucideIcon> = {
  Hotel: Building,
  HotelStaff: UserRound,
  HotelInvite: Mail,
  Room: Home,
  RoomType: Home,
  Guest: Users,
  Stay: ArrowRightToLine,
  Reservation: UserPlus,
  InventoryCategory: Package,
  InventoryItem: Package,
  StockMovement: Package,
}

const ENTITY_LABEL: Record<string, string> = {
  Hotel: 'Hotel',
  HotelStaff: 'Staff',
  HotelInvite: 'Invite',
  Room: 'Room',
  RoomType: 'Room Type',
  Guest: 'Guest',
  Stay: 'Stay',
  Reservation: 'Reservation',
  InventoryCategory: 'Inventory Category',
  InventoryItem: 'Inventory Item',
  StockMovement: 'Stock Movement',
}

const ACTION_VERB: Record<string, string> = {
  POST: 'Added',
  PATCH: 'Updated',
  PUT: 'Updated',
  DELETE: 'Removed',
}

export function buildActivityFeed(logs: AuditLog[]): ActivityEntry[] {
  return logs.map((log) => {
    const verb = ACTION_VERB[log.action] ?? log.action
    const entityLabel = ENTITY_LABEL[log.entity] ?? log.entity
    return {
      id: log.id,
      icon: ENTITY_ICON[log.entity] ?? AlertTriangle,
      tone: log.action === 'DELETE' ? 'destructive' : log.action === 'POST' ? 'success' : 'info',
      title: `${verb} ${entityLabel}`,
      actor: log.actorId ? log.actorId.slice(0, 8) : 'System',
      createdAt: log.createdAt,
    }
  })
}
