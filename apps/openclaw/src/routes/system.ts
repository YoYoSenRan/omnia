/**
 * 系统路由
 *
 * 健康检查、网关状态、同步操作、活动流
 *
 * @module routes/system
 */

import { Hono } from 'hono'
import { checkConnection } from '../db/index.js'
import { activityRepo } from '../db/repo/activity.js'
import { syncService } from '../services/sync.js'
import { getGatewayClient } from '../gateway/client.js'
import { ok, fail } from '../http/response.js'
import { CODE } from '../http/code.js'

export const systemRoutes = new Hono()

/** GET /health — 健康检查 */
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

/** GET /api/gateway/status — 网关连接状态 */
systemRoutes.get('/api/gateway/status', (c) => {
  const gw = getGatewayClient()
  return ok(c, {
    connected: gw?.connected ?? false,
    status: gw?.status ?? 'disconnected',
  })
})

/** POST /api/agents/sync — 触发多源同步 */
systemRoutes.post('/api/agents/sync', async (c) => {
  const result = await syncService.syncAgents({
    gatewayClient: getGatewayClient() ?? undefined,
  })
  return ok(c, result)
})

/** POST /api/agents/sync/preview — 同步预览 */
systemRoutes.post('/api/agents/sync/preview', async (c) => {
  const result = await syncService.syncAgents({
    gatewayClient: getGatewayClient() ?? undefined,
    dryRun: true,
  })
  return ok(c, result)
})

/** GET /api/activities — 活动流 */
systemRoutes.get('/api/activities', async (c) => {
  const limit = Number(c.req.query('limit') ?? 50)
  const activities = await activityRepo.findRecent(limit)
  return ok(c, activities)
})
