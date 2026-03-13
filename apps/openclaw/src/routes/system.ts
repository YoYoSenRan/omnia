/**
 * 系统路由
 *
 * 提供健康检查和系统状态查询功能。
 * /health 不需要鉴权，用于负载均衡和监控探针。
 *
 * @module routes/system
 */

import { Hono } from 'hono'
import { checkConnection } from '../db/index.js'
import { ok, fail } from '../lib/response.js'
import { CODE } from '../lib/code.js'

export const systemRoutes = new Hono()

/**
 * GET /health — 健康检查
 *
 * 返回服务状态和各依赖组件的健康状况。
 * 无需鉴权，供 Docker healthcheck / 负载均衡 / 监控系统使用。
 */
systemRoutes.get('/health', async (c) => {
  const dbHealthy = await checkConnection()

  if (!dbHealthy) {
    return fail(c, 503, CODE.INTERNAL_ERROR, 'Database connection unavailable')
  }

  return ok(c, {
    status: 'ok',
    service: 'openclaw',
    uptime: process.uptime(),
    checks: {
      database: dbHealthy ? 'ok' : 'fail',
    },
  })
})
