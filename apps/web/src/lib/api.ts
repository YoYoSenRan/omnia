/**
 * API 客户端
 *
 * 封装 fetch 请求，统一处理鉴权和错误。
 *
 * @module lib/api
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const API_KEY = import.meta.env.VITE_API_KEY ?? 'dev-app-api-key'

/**
 * API 错误类
 */
export class ApiError extends Error {
  status: number
  code: number

  constructor(status: number, code: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface ApiResponse<T> {
  ok: boolean
  code: number
  message: string
  data: T | null
}

/**
 * 发起 API 请求
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      ...init?.headers,
    },
  })

  const body: ApiResponse<T> = await res.json()

  if (!body.ok) {
    throw new ApiError(res.status, body.code, body.message)
  }

  return body.data as T
}
