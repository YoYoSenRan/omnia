/**
 * Agent 路由（薄壳）
 *
 * @module routes/agents
 */

import { Hono } from 'hono'
import { agentService } from '../services/agent.js'
import { activityRepo } from '../db/repo/activity.js'
import { ok } from '../http/response.js'

// ── 内部路由（/api/agents） ──────────────────────────────

export const agentRoutes = new Hono()

agentRoutes.get('/', async (c) => {
  const agents = await agentService.list()
  return ok(c, agents)
})

agentRoutes.get('/:id', async (c) => {
  const agent = await agentService.getById(c.req.param('id'))
  return ok(c, agent)
})

agentRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const agent = await agentService.create(body)
  return ok(c, agent, 201)
})

agentRoutes.put('/:id', async (c) => {
  const body = await c.req.json()
  const agent = await agentService.update(c.req.param('id'), body)
  return ok(c, agent)
})

agentRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param()
  await agentService.remove(id)
  return ok(c, { id })
})

agentRoutes.get('/:id/soul', async (c) => {
  const soul = await agentService.getSoul(c.req.param('id'))
  return ok(c, { soul })
})

agentRoutes.put('/:id/soul', async (c) => {
  const { id } = c.req.param()
  const { soul } = await c.req.json()
  await agentService.updateSoul(id, soul)
  return ok(c, { id, soul })
})

agentRoutes.get('/:id/logs', async (c) => {
  const { id } = c.req.param()
  const limit = Number(c.req.query('limit') ?? 50)
  const logs = await activityRepo.findByEntity('agent', id, limit)
  return ok(c, logs)
})

// ── 开放路由（/open/agents） ─────────────────────────────

export const agentOpenRoutes = new Hono()

agentOpenRoutes.get('/', async (c) => {
  const agents = await agentService.list()
  return ok(c, agents)
})

agentOpenRoutes.get('/:id', async (c) => {
  const agent = await agentService.getById(c.req.param('id'))
  return ok(c, agent)
})
