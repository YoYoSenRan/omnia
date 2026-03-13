/** API 基础地址 */
const API_BASE = import.meta.env.VITE_API_BASE ?? ""

/** API Key（从环境变量读取，开发环境默认值） */
const API_KEY = import.meta.env.VITE_API_KEY ?? "dev-api-key"

/**
 * API 错误类
 *
 * 封装服务端返回的错误信息，包含 HTTP 状态码和业务错误码。
 */
export class ApiError extends Error {
  /** HTTP 状态码 */
  status: number
  /** 业务错误码 */
  code: number

  constructor(status: number, code: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
  }
}

/**
 * 统一 API 响应格式
 */
interface ApiResponse<T> {
  ok: boolean
  code: number
  message: string
  data: T | null
}

/**
 * 发起 API 请求
 *
 * @param path - 请求路径（如 '/api/agents'）
 * @param init - fetch 配置选项
 * @returns 响应数据（ApiResponse.data）
 * @throws {ApiError} 当响应 ok 为 false 或 HTTP 状态非 2xx 时
 *
 * @example
 * ```ts
 * const agents = await request<Agent[]>('/api/agents')
 * ```
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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
