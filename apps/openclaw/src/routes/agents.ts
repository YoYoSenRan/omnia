/**
 * Agent 路由映射
 *
 * @module routes/agents
 */

import { Hono } from 'hono'
import { agentController as ctrl } from '../controllers/agent.js'

// ── /api/agents ──────────────────────────────────────────

export const agentRoutes = new Hono()

agentRoutes.get('/', ctrl.list)
agentRoutes.get('/:id', ctrl.getById)
agentRoutes.post('/', ctrl.create)
agentRoutes.put('/:id', ctrl.update)
agentRoutes.delete('/:id', ctrl.remove)
agentRoutes.get('/:id/soul', ctrl.getSoul)
agentRoutes.put('/:id/soul', ctrl.updateSoul)
agentRoutes.get('/:id/logs', ctrl.getLogs)

// ── /open/agents ─────────────────────────────────────────

export const agentOpenRoutes = new Hono()

agentOpenRoutes.get('/', ctrl.list)
agentOpenRoutes.get('/:id', ctrl.getById)
