import { useCallback, useRef, useSyncExternalStore } from 'react'
import type { Observable } from 'rxjs'

export interface RxQueryResult<T> {
  data: T[] | undefined
  isLoading: boolean
}

// Bridges an RxDB reactive query Observable (`collection.find(...).$`) into
// React via useSyncExternalStore, so components re-render on local writes
// and on documents arriving from replication — without going through
// TanStack Query, which owns non-replicated data instead (see this repo's
// CLAUDE.md). Pass `null` when the query isn't ready yet (e.g. the
// collection hasn't loaded), matching TanStack Query's `enabled: false`.
export function useRxQuery<T>(query$: Observable<T[]> | null): RxQueryResult<T> {
  const snapshotRef = useRef<RxQueryResult<T>>({ data: undefined, isLoading: query$ !== null })

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!query$) {
        snapshotRef.current = { data: undefined, isLoading: false }
        onStoreChange()
        return () => {}
      }
      snapshotRef.current = { data: snapshotRef.current.data, isLoading: true }
      const subscription = query$.subscribe((value) => {
        snapshotRef.current = { data: value, isLoading: false }
        onStoreChange()
      })
      return () => subscription.unsubscribe()
    },
    [query$],
  )

  const getSnapshot = useCallback(() => snapshotRef.current, [])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
