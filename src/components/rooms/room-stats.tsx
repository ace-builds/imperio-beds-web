import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RoomWithDetails } from '@/lib/schemas/room'

export function RoomStats({ rooms }: { rooms: RoomWithDetails[] }) {
  const total = rooms.length
  const available = rooms.filter((room) => room.status === 'available').length
  const maintenance = rooms.filter((room) => room.status === 'maintenance').length
  const cleaning = rooms.filter((room) => room.status === 'cleaning').length
  const occupancy = total > 0 ? Math.round(((total - available) / total) * 100) : 0

  const stats = [
    { label: 'Total Rooms', value: total, hint: 'All Operational', tone: 'text-success' },
    { label: 'Available Today', value: available, hint: `${occupancy}% Occupancy`, tone: 'text-success' },
    {
      label: 'Maintenance',
      value: maintenance,
      hint: maintenance > 0 ? 'Needs attention' : 'None',
      tone: 'text-warning',
    },
    {
      label: 'Cleaning Required',
      value: cleaning,
      hint: cleaning > 0 ? 'High Priority' : 'None',
      tone: 'text-warning',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className={`text-sm ${stat.tone}`}>{stat.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
