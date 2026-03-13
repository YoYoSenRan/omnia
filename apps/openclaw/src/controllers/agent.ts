/**
 * Agent Controller
 *
 * @module controllers/agent
 */

import type { Context } from 'hono'
import { agentService } from '../services/agent.js'
import { activityRepo } from '../db/repo/activity.js'
import { ok } from '../http/response.js'
import { AgentCreateSchema, AgentUpdateSchema, AgentSoulSchema } from '../schemas/agent.js'

export const agentController = {
  list: async (c: Context) => {
    const agents = await agentService.list()
    return ok(c, agents)
  },

  getById: async (c: Context) => {
    const agent = await agentService.getById(c.req.param('id')!)
    return ok(c, agent)
  },

  create: async (c: Context) => {
    const body = AgentCreateSchema.parse(await c.req.json())
    const agent = await agentService.create(body)
    return ok(c, agent, 201)
  },

  update: async (c: Context) => {
    const body = AgentUpdateSchema.parse(await c.req.json())
    const agent = await agentService.update(c.req.param('id')!, body)
    return ok(c, agent)
  },

  remove: async (c: Context) => {
    const { id } = c.req.param()
    await agentService.remove(id)
    return ok(c, { id })
  },

  getSoul: async (c: Context) => {
    const soul = await agentService.getSoul(c.req.param('id')!)
    return ok(c, { soul })
  },

  updateSoul: async (c: Context) => {
    const { soul } = AgentSoulSchema.parse(await c.req.json())
    const id = c.req.param('id')!
    await agentService.updateSoul(id, soul)
    return ok(c, { id, soul })
  },

  getLogs: async (c: Context) => {
    const { id } = c.req.param()
    const limit = Number(c.req.query('limit') ?? 50)
    const logs = await activityRepo.findByEntity('agent', id, limit)
    return ok(c, logs)
  },
}
