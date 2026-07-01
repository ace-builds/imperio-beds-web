import { io } from 'socket.io-client'

// One shared connection for the whole app — pages join/leave hotel rooms on
// it rather than each opening their own socket. Matches the server's
// RoomsGateway (src/rooms/rooms.gateway.ts), which authenticates via the
// session cookie (withCredentials) and only ever pushes roomStatusChanged,
// never accepts writes.
export const socket = io(import.meta.env.VITE_SERVER_URL, {
  withCredentials: true,
  autoConnect: false,
})
