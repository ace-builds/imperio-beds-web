import { Subject } from 'rxjs'
import { replicateRxCollection } from 'rxdb/plugins/replication'
import type { RxCollection } from 'rxdb/plugins/core'
import { createSyncApi, type SyncCheckpoint } from './sync-api'
import { onSyncChanged, type SyncedCollection } from './sync-socket'

interface StartReplicationOptions<TDoc> {
  collection: RxCollection<TDoc>
  hotelId: string
  // Server route segment, e.g. 'room-types' in /hotels/:hotelId/sync/room-types.
  collectionPath: string
  // Matches the `collection` field the server's syncChanged socket event carries.
  syncedCollection: SyncedCollection
}

// Wires one RxDB collection to the server's pull/push sync endpoints. No
// custom `conflictHandler` is configured on these collections (see db.ts) —
// RxDB's default ("master always wins") is exactly correct here, since the
// server already performs the real field-level merge and returns the
// merged doc as the push response's conflicting row; the client just needs
// to accept it.
export function startReplication<TDoc extends { id: string; _deleted: boolean }>({
  collection,
  hotelId,
  collectionPath,
  syncedCollection,
}: StartReplicationOptions<TDoc>) {
  const api = createSyncApi<TDoc>(collectionPath)
  const pullStream$ = new Subject<'RESYNC'>()
  const unsubscribeSocket = onSyncChanged(syncedCollection, () => pullStream$.next('RESYNC'))

  const replicationState = replicateRxCollection<TDoc, SyncCheckpoint>({
    replicationIdentifier: `${collectionPath}-${hotelId}`,
    collection,
    live: true,
    retryTime: 5000,
    pull: {
      batchSize: 50,
      handler: (checkpoint, batchSize) => api.pull(hotelId, checkpoint, batchSize),
      stream$: pullStream$.asObservable(),
    },
    push: {
      batchSize: 50,
      handler: (rows) =>
        api.push(
          hotelId,
          rows.map((row) => ({
            newDocumentState: row.newDocumentState,
            assumedMasterState: row.assumedMasterState ?? null,
          })),
        ),
    },
  })

  return {
    replicationState,
    dispose: async () => {
      unsubscribeSocket()
      await replicationState.cancel()
    },
  }
}
