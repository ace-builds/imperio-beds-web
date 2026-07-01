import { apiFetch } from '@/lib/api/client'

export interface SyncCheckpoint {
  updatedAt: string
  id: string
}

// Server response shape uses `checkpoint: null` for "no rows"; RxDB's pull
// handler wants `undefined` there instead — mapped at this boundary so
// nothing above sync-api.ts needs to know about the server's wire format.
interface RawSyncPullResult<TDoc> {
  documents: TDoc[]
  checkpoint: SyncCheckpoint | null
}

export interface SyncPushRow<TDoc> {
  newDocumentState: TDoc
  assumedMasterState: TDoc | null
}

// Thin wrapper over the server's `hotels/:hotelId/sync/<collection>/{pull,push}`
// endpoints (imperio-beds-server/src/{rooms,room-types,guests,front-desk}) —
// one instance per collection, since the request/response shape is
// identical across all four, only the entity fields (TDoc) differ.
export function createSyncApi<TDoc extends { _deleted: boolean }>(collectionPath: string) {
  return {
    async pull(hotelId: string, checkpoint: SyncCheckpoint | undefined, batchSize: number) {
      const params = new URLSearchParams({ batchSize: String(batchSize) })
      if (checkpoint) {
        params.set('updatedAt', checkpoint.updatedAt)
        params.set('id', checkpoint.id)
      }
      const result = await apiFetch<RawSyncPullResult<TDoc>>(
        `/hotels/${hotelId}/sync/${collectionPath}/pull?${params.toString()}`,
        { hotelId },
      )
      return { documents: result.documents, checkpoint: result.checkpoint ?? undefined }
    },
    push(hotelId: string, rows: SyncPushRow<TDoc>[]) {
      return apiFetch<TDoc[]>(`/hotels/${hotelId}/sync/${collectionPath}/push`, {
        method: 'POST',
        body: JSON.stringify(rows),
        hotelId,
      })
    },
  }
}
