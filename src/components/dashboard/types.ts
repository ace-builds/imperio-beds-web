import type { LucideIcon } from 'lucide-react'
import type { Tone } from '@/components/dashboard/tone'

export type StatTrend = {
  label: string
  tone: Tone
  icon?: LucideIcon
}

export type RoomStatusSegment = {
  label: string
  count: number
  tone: Tone
}

export type ArrivalEntry = {
  id: string
  guestName: string
  roomType: string
  nights: number
  checkedIn: boolean
}

export type StaffShiftEntry = {
  id: string
  name: string
  role: string
  avatarUrl?: string
  onDuty: boolean
  lastActiveAt: Date | null
}

export type ActivityEntry = {
  id: string
  icon: LucideIcon
  tone: Tone
  title: string
  actor: string
  createdAt: Date
}
