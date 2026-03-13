/**
 * Core 服务客户端
 *
 * 封装对 openclaw 服务 /open/* 接口的调用。
 * 使用 Service Token 鉴权，统一处理超时、重试和错误传播。
 *
 * @module core-client
 */

import { OPENCLAW_URL, SERVICE_TOKEN } from './env.js'
import { logger } from './logger.js'
import { AppError } from './errors.js'
import { CODE } from './code.js'

/** 默认请求超时时间（毫秒） */
const DEFAULT_TIMEOUT = 10_000

/**
 * 向 openclaw 服务发起请求
 *
 * @param path - 请求路径（如 '/open/agents'）
 * @param init - fetch 配置选项
 * @returns 响应数据
 * @throws {AppError} 当 Core 服务不可用或返回错误时
 *
 * @example
 * ```ts
 * const agents = await coreRequest<Agent[]>('/open/agents')
 * ```
 */
export async function coreRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${OPENCLAW_URL}${path}`
  let res: Response

  try {
    res = await fetch(url, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT),
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': SERVICE_TOKEN,
        ...init?.headers,
      },
    })
  } catch (err) {
    /* 网络错误或超时 */
    logger.error({ err, path }, 'Core service unreachable')
    throw new AppError(503, CODE.CORE_UNAVAILABLE, 'Core service unavailable')
  }

  const body = await res.json() as { ok: boolean; code: number; message: string; data: T }

  if (!body.ok) {
    /* 透传 Core 服务的业务错误 */
    throw new AppError(res.status, body.code, body.message)
  }

  return body.data
}
