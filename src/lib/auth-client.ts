import { createAuthClient } from 'better-auth/react'
import { getAuthToken, setAuthToken, usesBearerAuth } from './auth-token'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3000',
  fetchOptions: {
    credentials: 'include',
    // In the browser build `getAuthToken()` always returns undefined and
    // better-fetch omits the header entirely, leaving the cookie in charge.
    auth: { type: 'Bearer', token: getAuthToken },
    onSuccess: (ctx) => {
      if (!usesBearerAuth) return
      // The server's bearer plugin attaches this on any response that sets a
      // session cookie — i.e. sign-in, and any later session refresh.
      const token = ctx.response.headers.get('set-auth-token')
      if (token) setAuthToken(token)
    },
  },
})
