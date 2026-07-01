import { DatePicker } from '@/components/date-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AUDIT_LOG_ENTITIES, type AuditLogFilters } from '@/lib/schemas/audit-log'

const ALL_ENTITIES = 'all'

export function AuditLogFiltersBar({
  filters,
  onChange,
}: {
  filters: AuditLogFilters
  onChange: (filters: AuditLogFilters) => void
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
      <div className="flex flex-col gap-1.5">
        <Label>From</Label>
        <DatePicker date={filters.from ?? new Date()} onDateChange={(from) => onChange({ ...filters, from, page: 1 })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>To</Label>
        <DatePicker date={filters.to ?? new Date()} onDateChange={(to) => onChange({ ...filters, to, page: 1 })} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Entity</Label>
        <Select
          value={filters.entity ?? ALL_ENTITIES}
          onValueChange={(entity) =>
            onChange({ ...filters, entity: entity === ALL_ENTITIES ? undefined : entity, page: 1 })
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ENTITIES}>All entities</SelectItem>
            {AUDIT_LOG_ENTITIES.map((entity) => (
              <SelectItem key={entity} value={entity}>
                {entity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-actor">Actor ID</Label>
        <Input
          id="audit-actor"
          placeholder="Paste a user id"
          className="w-48"
          value={filters.actorId ?? ''}
          onChange={(event) =>
            onChange({ ...filters, actorId: event.target.value || undefined, page: 1 })
          }
        />
      </div>
      <Button
        variant="outline"
        onClick={() => onChange({ page: 1 })}
      >
        Clear filters
      </Button>
    </div>
  )
}
