type ApiFetchOptions = RequestInit & { hotelId?: string }

export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const { hotelId, headers, ...init } = options ?? {}

  const res = await fetch(`${import.meta.env.VITE_SERVER_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(hotelId ? { 'x-hotel-id': hotelId } : {}),
      ...headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? res.statusText)
  }

  return res.status === 204 ? (undefined as T) : res.json()
}
