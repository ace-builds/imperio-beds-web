import { isTauri } from '@tauri-apps/api/core'

const TOKEN_KEY = 'imperiobeds.bearer-token'

// The browser build authenticates with BetterAuth's httpOnly session cookie
// and should keep doing so — a token sitting in localStorage is readable by
// any XSS, and the cookie isn't.
//
// The packaged desktop build can't use the cookie: its origin is
// tauri://localhost (http://tauri.localhost on Windows), which makes the
// session cookie third-party relative to the API, and WKWebView blocks
// third-party cookies outright. So the desktop build falls back to
// BetterAuth's bearer plugin, the same mechanism the Expo app uses.
//
// True in `desktop:dev` as well, even though that build is served from
// http://localhost:5179 and could still use cookies — deliberately, so the
// auth path exercised in development is the one that ships.
export const usesBearerAuth = isTauri()

export function getAuthToken(): string | undefined {
  if (!usesBearerAuth) return undefined
  return localStorage.getItem(TOKEN_KEY) ?? undefined
}

export function setAuthToken(token: string) {
  if (!usesBearerAuth) return
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// Spread into a `fetch`/Socket.IO header bag. Empty in the browser build,
// where the cookie does this job.
export function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
