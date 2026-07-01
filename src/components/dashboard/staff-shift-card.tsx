import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StaffShiftEntry } from '@/components/dashboard/types'

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function formatLastActive(date: Date | null) {
  if (!date) return 'Not active yet'
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function StaffShiftCard({
  title,
  staff,
}: {
  title: string
  staff: StaffShiftEntry[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link to="/staff">View Roster</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col divide-y">
        {staff.length === 0 && (
          <p className="py-2.5 text-sm text-muted-foreground">No staff on record yet.</p>
        )}
        {staff.map((member) => (
          <div key={member.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <Avatar>
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback>{initials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{member.name}</span>
              <span className="text-xs text-muted-foreground">{member.role}</span>
            </div>
            <Badge variant={member.onDuty ? 'success' : 'secondary'}>
              {member.onDuty ? `On Duty (${formatLastActive(member.lastActiveAt)})` : 'Off Duty'}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
