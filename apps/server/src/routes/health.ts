/**
 * 健康检查路由
 *
 * @module routes/health
 */

import { Hono } from 'hono'
import { checkConnection } from '../db/index.js'
import { ok, fail } from '../lib/response.js'
import { CODE } from '../lib/code.js'

export const healthRoutes = new Hono()

/** GET /health — 健康检查 */
healthRoutes.get('/health', async (c) => {
  const dbHealthy = await checkConnection()

  if (!dbHealthy) {
    return fail(c, 503, CODE.INTERNAL_ERROR, 'Database connection unavailable')
  }

  return ok(c, {
    status: 'ok',
    service: 'server',
    uptime: process.uptime(),
    checks: { database: dbHealthy ? 'ok' : 'fail' },
  })
})
