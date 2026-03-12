import { Hono } from 'hono'
import type { AdapterManager } from '../adapter'
import { ok, fail } from '../lib/response'

export function agentRoutes(manager: AdapterManager) {
  const app = new Hono()

  // List all agents
  app.get('/', async (c) => {
    const result = await manager.getActive()!.listAgents()
    return ok(c, result)
  })

  // Create agent
  app.post('/', async (c) => {
    const body = await c.req.json<{ name: string; emoji?: string; model?: string }>()
    if (!body.name) {
      return fail(c, 400, 'INVALID_REQUEST', 'name is required')
    }
    const agent = await manager.getActive()!.createAgent(body)
    return ok(c, agent, 201)
  })

  // Update agent
  app.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json<{ name?: string; emoji?: string; model?: string }>()
    const agent = await manager.getActive()!.updateAgent(id, body)
    return ok(c, agent)
  })

  // Delete agent
  app.delete('/:id', async (c) => {
    const id = c.req.param('id')
    await manager.getActive()!.deleteAgent(id)
    return ok(c, null)
  })

  // Send an agent message (triggers an agent run)
  app.post('/run', async (c) => {
    const body = await c.req.json<{
      agent?: string
      sessionId?: string
      to?: string
      message: string
    }>()
    const result = await manager.getActive()!.sendAgentMessage(body)
    return ok(c, result)
  })

  return app
}
