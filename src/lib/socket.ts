import { io } from 'socket.io-client'
import { authHeaders } from '@/lib/auth-token'

// One shared connection for the whole app — pages join/leave hotel rooms on
// it rather than each opening their own socket. Matches the server's
// SyncGateway (src/sync/sync.gateway.ts), which authenticates via the
// session cookie (withCredentials) and only ever pushes roomStatusChanged/
// syncChanged, never accepts writes.
export const socket = io(import.meta.env.VITE_SERVER_URL, {
  withCredentials: true,
  autoConnect: false,
})

// Connect with whatever credential this build authenticates by. The server's
// AuthGuard reads the session off `handshake.headers`, and Socket.IO only
// applies `extraHeaders` to the HTTP polling handshake (browsers can't set
// headers on a raw WebSocket) — so the default ['polling', 'websocket']
// transport order has to stay as it is for the desktop build's bearer token
// to arrive. Set per connect rather than at io() time because there's no
// token yet when this module is first evaluated.
export function connectSocket() {
  socket.io.opts.extraHeaders = authHeaders()
  socket.connect()
}
