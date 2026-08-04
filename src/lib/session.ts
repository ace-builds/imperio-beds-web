import { authClient } from './auth-client'
import { clearAuthToken } from './auth-token'

export type SessionData = typeof authClient.$Infer.Session

const SESSION_KEY = 'imperiobeds.session'

interface CachedSession {
  session: SessionData
  // Copied out of session.expiresAt at write time: after a JSON round-trip
  // the nested value is a string, not the Date its type claims.
  expiresAt: string
}

export interface ResolvedSession {
  session: SessionData
  // True when the server couldn't be reached and this came from the cache.
  // The app is usable (RxDB holds the data) but the session is unverified.
  isOffline: boolean
}

function writeCache(session: SessionData) {
  const cached: CachedSession = {
    session,
    expiresAt: new Date(session.session.expiresAt).toISOString(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(cached))
}

function readCache(): SessionData | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    const cached = JSON.parse(raw) as CachedSession
    // Honour the server's own expiry offline — a cached session is a stand-in
    // for a session we can't check right now, not a way to outlive one.
    if (new Date(cached.expiresAt).getTime() <= Date.now()) {
      clearSession()
      return null
    }
    return cached.session
  } catch {
    clearSession()
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  clearAuthToken()
}

// Resolves the current session for the route guard, distinguishing "the
// server says you're signed out" from "we can't reach the server right now".
// Only the first should log anyone out: this is an offline-first app whose
// data lives in RxDB, so a front-desk machine rebooting while the network or
// API is down must still open into the app rather than into a login screen
// it also can't submit.
export async function resolveSession(): Promise<ResolvedSession | null> {
  try {
    const { data, error } = await authClient.getSession()

    if (data) {
      writeCache(data)
      return { session: data, isOffline: false }
    }

    // A 200 carrying no session is the definitive signed-out answer — the
    // only case where the cache should be thrown away.
    if (!error) {
      clearSession()
      return null
    }
  } catch {
    // An unreachable API throws out of getSession rather than returning an
    // `error` (verified: better-fetch lets `TypeError: fetch failed` through).
    // Uncaught it would fail the whole route load — here it just means the
    // session is unverifiable, which is not the same as signed out.
  }

  const cached = readCache()
  return cached ? { session: cached, isOffline: true } : null
}

export async function signOut() {
  try {
    await authClient.signOut()
  } finally {
    // Clear locally even if the request failed (offline sign-out) — leaving
    // the cache behind would let the next launch walk straight back in.
    clearSession()
  }
}
