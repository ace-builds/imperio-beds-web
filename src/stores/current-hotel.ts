import { create } from 'zustand'

type CurrentHotelStore = {
  activeHotelId: string | null
  setActiveHotelId: (hotelId: string | null) => void
}

export const useCurrentHotelStore = create<CurrentHotelStore>((set) => ({
  activeHotelId: null,
  setActiveHotelId: (hotelId) => set({ activeHotelId: hotelId }),
}))
