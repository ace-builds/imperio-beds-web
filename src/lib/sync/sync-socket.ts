import { socket } from '@/lib/socket'

export type SyncedCollection = 'rooms' | 'room-types' | 'guests' | 'stays'

interface SyncChangedPayload {
  collection: SyncedCollection
}

// The server's SyncGateway (imperio-beds-server/src/sync/sync.gateway.ts)
// emits `syncChanged` into a hotel's Socket.IO room whenever a REST mutation
// or sync push changes that collection — this is purely a "something
// changed, go re-pull" signal (no document payload), fed into each
// collection's RxDB replication as its `pullStream$`.
export function onSyncChanged(collection: SyncedCollection, cb: () => void): () => void {
  function handleSyncChanged(payload: SyncChangedPayload) {
    if (payload.collection !== collection) return
    cb()
  }
  socket.on('syncChanged', handleSyncChanged)
  return () => socket.off('syncChanged', handleSyncChanged)
}

export function joinHotelForSync(hotelId: string) {
  socket.connect()
  socket.emit('joinHotel', { hotelId })
}
