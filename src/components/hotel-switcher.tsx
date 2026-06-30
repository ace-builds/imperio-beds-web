import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMyHotelAccess } from '@/hooks/use-hotel-access'
import { useCurrentHotelStore } from '@/stores/current-hotel'

// Only ever renders a real switcher for owners — non-owner staff are scoped
// to exactly one hotel, so they'll never have more than one entry here.
export function HotelSwitcher() {
  const { data: hotelAccess } = useMyHotelAccess()
  const activeHotelId = useCurrentHotelStore((state) => state.activeHotelId)
  const setActiveHotelId = useCurrentHotelStore((state) => state.setActiveHotelId)

  if (!hotelAccess || hotelAccess.length <= 1) {
    return null
  }

  const activeHotel = hotelAccess.find((item) => item.hotelId === activeHotelId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {activeHotel?.hotelName ?? 'Select hotel'}
          <ChevronsUpDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {hotelAccess.map((item) => (
          <DropdownMenuItem key={item.hotelId} onSelect={() => setActiveHotelId(item.hotelId)}>
            {item.hotelName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
