import { Building2, ChevronsUpDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMyHotelAccess } from '@/hooks/use-hotel-access'
import { useCurrentHotelStore } from '@/stores/current-hotel'
import { cn } from '@/lib/utils'

const cardClassName =
  'flex w-full items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-left text-sm'

// Non-owner staff are scoped to exactly one hotel, so they only ever see the
// static card. Owners with multiple hotels get the same card as a dropdown
// trigger instead.
export function HotelSwitcher() {
  const { data: hotelAccess } = useMyHotelAccess()
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId)
  const setActiveHotelId = useCurrentHotelStore((state) => state.setActiveHotelId)

  if (!hotelAccess || hotelAccess.length === 0) {
    return null
  }

  const activeHotel = hotelAccess.find((item) => item.hotelId === activeHotelId) ?? hotelAccess[0]

  if (hotelAccess.length === 1) {
    return (
      <div className={cardClassName}>
        <Building2 className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate font-medium">{activeHotel.hotelName}</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn(cardClassName, 'hover:bg-accent')}>
          <Building2 className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{activeHotel.hotelName}</span>
          <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
        {hotelAccess.map((item) => (
          <DropdownMenuItem key={item.hotelId} onSelect={() => setActiveHotelId(item.hotelId)}>
            {item.hotelName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
