/**
 * System Controller
 *
 * @module controllers/system
 */

import type { Context } from 'hono'
import { checkConnection } from '../db/index.js'
import { activityRepo } from '../db/repo/activity.js'
import { syncService } from '../services/sync.js'
import { getGatewayClient } from '../gateway/client.js'
import { ok, fail } from '../http/response.js'
import { CODE } from '../http/code.js'

export const systemController = {
  health: async (c: Context) => {
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
  },

  gatewayStatus: (c: Context) => {
    const gw = getGatewayClient()
    return ok(c, {
      connected: gw?.connected ?? false,
      status: gw?.status ?? 'disconnected',
    })
  },

  sync: async (c: Context) => {
    const result = await syncService.syncAgents({
      gatewayClient: getGatewayClient() ?? undefined,
    })
    return ok(c, result)
  },

  syncPreview: async (c: Context) => {
    const result = await syncService.syncAgents({
      gatewayClient: getGatewayClient() ?? undefined,
      dryRun: true,
    })
    return ok(c, result)
  },

  activities: async (c: Context) => {
    const limit = Number(c.req.query('limit') ?? 50)
    const activities = await activityRepo.findRecent(limit)
    return ok(c, activities)
  },
}
