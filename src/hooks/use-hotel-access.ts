import { useQuery } from '@tanstack/react-query'
import { getMyHotelAccess } from '@/lib/api/hotels'

export function useMyHotelAccess() {
  return useQuery({
    queryKey: ['hotel-access'],
    queryFn: getMyHotelAccess,
  })
}
