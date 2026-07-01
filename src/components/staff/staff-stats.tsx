import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { HotelInvite, HotelStaffWithUser } from '@/lib/schemas/hotel'

export function StaffStats({
  staff,
  invites,
}: {
  staff: HotelStaffWithUser[]
  invites: HotelInvite[]
}) {
  const active = staff.filter((member) => member.status === 'active')
  const onShift = active.filter((member) => member.onDuty).length
  const suspended = staff.length - active.length

  const stats = [
    {
      label: 'Total Staff',
      value: staff.length,
      hint: `${active.length} active`,
      tone: 'text-muted-foreground',
    },
    {
      label: 'On Shift Now',
      value: onShift,
      hint: onShift > 0 ? 'Clocked in' : 'Nobody clocked in',
      tone: 'text-success',
    },
    {
      label: 'Suspended',
      value: suspended,
      hint: suspended > 0 ? 'Access revoked' : 'None',
      tone: suspended > 0 ? 'text-destructive' : 'text-muted-foreground',
    },
    {
      label: 'Pending Invites',
      value: invites.length,
      hint: invites.length > 0 ? 'Awaiting response' : 'None outstanding',
      tone: invites.length > 0 ? 'text-warning' : 'text-muted-foreground',
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
