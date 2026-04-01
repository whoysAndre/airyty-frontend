const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init)
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : (data.message ?? 'Something went wrong')
    throw new ApiError(res.status, message)
  }

  return data as T
}

function authHeader(token?: string): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const apiClient = {
  get<T>(path: string, token?: string) {
    return request<T>(path, { headers: authHeader(token) })
  },

  post<T>(path: string, body: unknown, token?: string) {
    return request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify(body),
    })
  },

  // No Content-Type header — browser sets it with multipart boundary
  postForm<T>(path: string, form: FormData, token?: string) {
    return request<T>(path, {
      method: 'POST',
      headers: authHeader(token),
      body: form,
    })
  },

  patch<T>(path: string, body: unknown, token?: string) {
    return request<T>(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify(body),
    })
  },

  patchForm<T>(path: string, form: FormData, token?: string) {
    return request<T>(path, {
      method: 'PATCH',
      headers: authHeader(token),
      body: form,
    })
  },

  delete<T>(path: string, body?: unknown, token?: string) {
    return request<T>(path, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: body ? JSON.stringify(body) : undefined,
    })
  },
}
