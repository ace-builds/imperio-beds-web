import {
  createRxDatabase,
  addRxPlugin,
  type RxCollection,
  type RxDatabase,
  type RxJsonSchema,
} from 'rxdb/plugins/core'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'
import { ROOM_STATUSES } from '@/lib/schemas/room'
import { STAY_STATUSES } from '@/lib/schemas/stay'

// Offline-replicated document shapes. These extend the REST Zod schemas
// (room.ts/room-type.ts/guest.ts/stay.ts) with the two fields the sync
// protocol needs on top of the domain fields — `version` (optimistic
// concurrency, compared against the server's row on push) and `_deleted`
// (soft-delete tombstone, RxDB's own convention for propagating deletes).
// Dates are ISO strings, not `Date` objects — RxDB schemas are JSON-schema
// based and don't support `Date` as a property type.
export interface RoomDoc {
  id: string
  hotelId: string
  roomTypeId: string
  number: string
  status: (typeof ROOM_STATUSES)[number]
  pricePerNight: number | null
  createdAt: string
  updatedAt: string
  version: number
  _deleted: boolean
}

export interface RoomTypeDoc {
  id: string
  hotelId: string
  name: string
  description: string | null
  pricePerNight: number | null
  createdAt: string
  updatedAt: string
  version: number
  _deleted: boolean
}

export interface GuestDoc {
  id: string
  hotelId: string
  name: string
  phone: string | null
  email: string | null
  createdAt: string
  updatedAt: string
  version: number
  _deleted: boolean
}

export interface StayDoc {
  id: string
  hotelId: string
  guestId: string
  roomId: string
  status: (typeof STAY_STATUSES)[number]
  ratePerNight: number
  checkInAt: string
  expectedCheckOutAt: string
  checkOutAt: string | null
  createdAt: string
  updatedAt: string
  version: number
  _deleted: boolean
}

// Schema `version: 0` below is RxDB's own schema-migration version, unrelated
// to the domain `version` field (optimistic concurrency) declared inside
// `properties` — don't conflate the two.
const roomSchemaLiteral: RxJsonSchema<RoomDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    hotelId: { type: 'string', maxLength: 100 },
    roomTypeId: { type: 'string', maxLength: 100 },
    number: { type: 'string' },
    status: { type: 'string', enum: ROOM_STATUSES },
    pricePerNight: { type: ['number', 'null'] },
    createdAt: { type: 'string', maxLength: 32 },
    updatedAt: { type: 'string', maxLength: 32 },
    version: { type: 'number', minimum: 0, maximum: 1000000, multipleOf: 1 },
    _deleted: { type: 'boolean' },
  },
  required: ['id', 'hotelId', 'roomTypeId', 'number', 'status', 'version', 'updatedAt', 'createdAt'],
  indexes: ['hotelId', 'updatedAt'],
}

const roomTypeSchemaLiteral: RxJsonSchema<RoomTypeDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    hotelId: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    description: { type: ['string', 'null'] },
    pricePerNight: { type: ['number', 'null'] },
    createdAt: { type: 'string', maxLength: 32 },
    updatedAt: { type: 'string', maxLength: 32 },
    version: { type: 'number', minimum: 0, maximum: 1000000, multipleOf: 1 },
    _deleted: { type: 'boolean' },
  },
  required: ['id', 'hotelId', 'name', 'version', 'updatedAt', 'createdAt'],
  indexes: ['hotelId', 'updatedAt'],
}

const guestSchemaLiteral: RxJsonSchema<GuestDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    hotelId: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    phone: { type: ['string', 'null'] },
    email: { type: ['string', 'null'] },
    createdAt: { type: 'string', maxLength: 32 },
    updatedAt: { type: 'string', maxLength: 32 },
    version: { type: 'number', minimum: 0, maximum: 1000000, multipleOf: 1 },
    _deleted: { type: 'boolean' },
  },
  required: ['id', 'hotelId', 'name', 'version', 'updatedAt', 'createdAt'],
  indexes: ['hotelId', 'updatedAt'],
}

const staySchemaLiteral: RxJsonSchema<StayDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    hotelId: { type: 'string', maxLength: 100 },
    guestId: { type: 'string', maxLength: 100 },
    roomId: { type: 'string', maxLength: 100 },
    status: { type: 'string', enum: STAY_STATUSES },
    ratePerNight: { type: 'number' },
    checkInAt: { type: 'string', maxLength: 32 },
    expectedCheckOutAt: { type: 'string', maxLength: 32 },
    checkOutAt: { type: ['string', 'null'], maxLength: 32 },
    createdAt: { type: 'string', maxLength: 32 },
    updatedAt: { type: 'string', maxLength: 32 },
    version: { type: 'number', minimum: 0, maximum: 1000000, multipleOf: 1 },
    _deleted: { type: 'boolean' },
  },
  required: [
    'id',
    'hotelId',
    'guestId',
    'roomId',
    'status',
    'ratePerNight',
    'checkInAt',
    'expectedCheckOutAt',
    'version',
    'updatedAt',
    'createdAt',
  ],
  indexes: ['hotelId', 'updatedAt'],
}

export interface ImperioCollections {
  rooms: RxCollection<RoomDoc>
  roomTypes: RxCollection<RoomTypeDoc>
  guests: RxCollection<GuestDoc>
  stays: RxCollection<StayDoc>
}

export type ImperioDatabase = RxDatabase<ImperioCollections>

let dbPromise: Promise<ImperioDatabase> | null = null

async function createDb(): Promise<ImperioDatabase> {
  if (import.meta.env.DEV) {
    const { RxDBDevModePlugin } = await import('rxdb/plugins/dev-mode')
    addRxPlugin(RxDBDevModePlugin)
  }

  const storage = wrappedValidateAjvStorage({ storage: getRxStorageDexie() })

  const db = await createRxDatabase<ImperioCollections>({
    name: 'imperiobeds',
    storage,
  })

  await db.addCollections({
    rooms: { schema: roomSchemaLiteral },
    roomTypes: { schema: roomTypeSchemaLiteral },
    guests: { schema: guestSchemaLiteral },
    stays: { schema: staySchemaLiteral },
  })

  return db
}

export function getDb(): Promise<ImperioDatabase> {
  if (!dbPromise) {
    dbPromise = createDb()
  }
  return dbPromise
}
