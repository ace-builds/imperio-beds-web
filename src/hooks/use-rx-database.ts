import { useEffect, useState } from 'react'
import { getDb, type ImperioDatabase } from '@/lib/db'

// `getDb()` is async (RxDB collection setup), so components render once
// with `null` before the singleton resolves — every RxDB-backed hook goes
// through this instead of awaiting getDb() itself, so the promise only
// resolves once for the whole app.
export function useRxDatabase(): ImperioDatabase | null {
  const [db, setDb] = useState<ImperioDatabase | null>(null)

  useEffect(() => {
    let cancelled = false
    void getDb().then((instance) => {
      if (!cancelled) setDb(instance)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return db
}
