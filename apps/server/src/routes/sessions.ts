import { Hono } from 'hono'
import type { OpenClawAdapter } from '../adapter'

export function sessionRoutes(adapter: OpenClawAdapter) {
  const app = new Hono()

  app.get('/', async (c) => {
    const sessions = await adapter.listSessions()
    return c.json(sessions)
  })

  app.post('/:id/reset', async (c) => {
    const id = c.req.param('id')
    const result = await adapter.resetSession(id)
    return c.json(result)
  })

  app.post('/:id/compact', async (c) => {
    const id = c.req.param('id')
    const result = await adapter.compactSession(id)
    return c.json(result)
  })

  return app
}
