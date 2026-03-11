import { Hono } from 'hono'
import type { OpenClawAdapter } from '../adapter'

export function agentRoutes(adapter: OpenClawAdapter) {
  const app = new Hono()

  app.get('/', async (c) => {
    const agents = await adapter.listAgents()
    return c.json(agents)
  })

  app.post('/', async (c) => {
    const body = await c.req.json()
    const agent = await adapter.createAgent(body)
    return c.json(agent, 201)
  })

  app.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    const agent = await adapter.updateAgent(id, body)
    return c.json(agent)
  })

  app.delete('/:id', async (c) => {
    const id = c.req.param('id')
    await adapter.deleteAgent(id)
    return c.json({ ok: true })
  })

  return app
}
