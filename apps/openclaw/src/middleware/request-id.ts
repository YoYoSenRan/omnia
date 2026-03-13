/**
 * 请求 ID 中间件
 *
 * 为每个请求注入唯一的 X-Request-Id 头，并记录请求日志。
 *
 * @module middleware/request-id
 */

import type { Context, Next } from 'hono'
import { logger } from '../utils/logger.js'

/**
 * 请求 ID 注入 + 结构化请求日志
 */
export async function requestId(c: Context, next: Next) {
  const reqId = c.req.header('X-Request-Id') ?? crypto.randomUUID()
  c.set('reqId', reqId)
  c.header('X-Request-Id', reqId)

  const start = Date.now()
  await next()
  const duration = Date.now() - start

  logger.info(
    {
      reqId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration,
    },
    'Request completed',
  )
}
