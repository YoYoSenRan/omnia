/**
 * System 路由映射
 *
 * @module routes/system
 */

import { Hono } from 'hono'
import { systemController as ctrl } from '../controllers/system.js'

export const systemRoutes = new Hono()

systemRoutes.get('/health', ctrl.health)
systemRoutes.get('/api/gateway/status', ctrl.gatewayStatus)
systemRoutes.post('/api/agents/sync', ctrl.sync)
systemRoutes.post('/api/agents/sync/preview', ctrl.syncPreview)
systemRoutes.get('/api/activities', ctrl.activities)
