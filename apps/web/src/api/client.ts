import type { ApiResponse } from '@omnia/types'
import { API_BASE } from '@/lib/constants'

export class ApiError extends Error {
  status: number
  code: string | number

  constructor(status: number, code: string | number, msg: string) {
    super(msg)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  const json = await res.json() as ApiResponse<T>

  if (!json.ok) {
    throw new ApiError(res.status, json.code, json.msg)
  }

  return json.data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
