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
          <Button variant="outline" size="sm">
            View Roster
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col divide-y">
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
            <Badge variant={member.late ? 'destructive' : 'success'}>
              {member.late ? `Late (${member.time})` : member.time}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
