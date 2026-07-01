import { io } from 'socket.io-client'

// One shared connection for the whole app — pages join/leave hotel rooms on
// it rather than each opening their own socket. Matches the server's
// SyncGateway (src/sync/sync.gateway.ts), which authenticates via the
// session cookie (withCredentials) and only ever pushes roomStatusChanged/
// syncChanged, never accepts writes.
export const socket = io(import.meta.env.VITE_SERVER_URL, {
  withCredentials: true,
  autoConnect: false,
})
