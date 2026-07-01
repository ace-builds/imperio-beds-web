import { useEffect } from 'react'
import { socket } from '@/lib/socket'
import { startReplication } from '@/lib/sync/replication'
import { joinHotelForSync } from '@/lib/sync/sync-socket'
import { useRxDatabase } from './use-rx-database'

// Starts/stops the 4 offline-replicated collections' RxDB sync as the
// active hotel changes, and forces a resync on every socket (re)connect —
// pullStream$ alone can't cover changes missed while disconnected, since a
// dropped socket means missed syncChanged events by definition. Mount once
// near the authenticated layout root (see routes/_authenticated.tsx) so
// replication persists across route navigation within the same hotel and
// only restarts on hotel switch.
export function useHotelReplication(hotelId: string | null | undefined) {
  const db = useRxDatabase()

  useEffect(() => {
    if (!db || !hotelId) return

    joinHotelForSync(hotelId)

    const replications = [
      startReplication({ collection: db.rooms, hotelId, collectionPath: 'rooms', syncedCollection: 'rooms' }),
      startReplication({
        collection: db.roomTypes,
        hotelId,
        collectionPath: 'room-types',
        syncedCollection: 'room-types',
      }),
      startReplication({ collection: db.guests, hotelId, collectionPath: 'guests', syncedCollection: 'guests' }),
      startReplication({ collection: db.stays, hotelId, collectionPath: 'stays', syncedCollection: 'stays' }),
    ]

    function handleReconnect() {
      for (const { replicationState } of replications) {
        replicationState.reSync()
      }
    }
    socket.on('connect', handleReconnect)

    return () => {
      socket.off('connect', handleReconnect)
      for (const { dispose } of replications) {
        void dispose()
      }
    }
  }, [db, hotelId])
}
