import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CurrentHotelStore = {
  activeHotelId: string | null
  setActiveHotelId: (hotelId: string | null) => void
}

// Persisted because the authenticated layout otherwise picks the active
// hotel from /me/hotel-access, which is unavailable on an offline start —
// with no remembered hotel there'd be nothing to point RxDB at, and the app
// would open empty on exactly the machines that depend on it working
// offline. `_authenticated.tsx` drops the stored id once the real access
// list comes back and no longer contains it.
export const useCurrentHotelStore = create<CurrentHotelStore>()(
  persist(
    (set) => ({
      activeHotelId: null,
      setActiveHotelId: (hotelId) => set({ activeHotelId: hotelId }),
    }),
    { name: 'imperiobeds.active-hotel' },
  ),
)
