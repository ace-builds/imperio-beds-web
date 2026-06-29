import { createRxDatabase, addRxPlugin, type RxDatabase } from 'rxdb/plugins/core'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'

let dbPromise: Promise<RxDatabase> | null = null

async function createDb() {
  if (import.meta.env.DEV) {
    const { RxDBDevModePlugin } = await import('rxdb/plugins/dev-mode')
    addRxPlugin(RxDBDevModePlugin)
  }

  const storage = wrappedValidateAjvStorage({ storage: getRxStorageDexie() })

  // Collections are added here once domain schemas exist for this app.
  return createRxDatabase({
    name: 'imperiobeds',
    storage,
  })
}

export function getDb(): Promise<RxDatabase> {
  if (!dbPromise) {
    dbPromise = createDb()
  }
  return dbPromise
}
