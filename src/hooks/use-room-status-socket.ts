import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socket } from '@/lib/socket'
import type { Room } from '@/lib/schemas/room'

// Keeps the rooms list fresh when another client (or another tab) changes a
// room's status — the server's RoomsGateway broadcasts roomStatusChanged to
// everyone who joined the hotel's Socket.IO room.
export function useRoomStatusSocket(hotelId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!hotelId) return

    function handleRoomStatusChanged(room: Room) {
      if (room.hotelId !== hotelId) return
      void queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'rooms'] })
    }

    socket.connect()
    socket.emit('joinHotel', { hotelId })
    socket.on('roomStatusChanged', handleRoomStatusChanged)

    return () => {
      socket.off('roomStatusChanged', handleRoomStatusChanged)
    }
  }, [hotelId, queryClient])
}
