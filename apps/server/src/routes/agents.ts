import { Hono } from 'hono'
import type { AdapterManager } from '../adapter'
import { ok } from '../lib/response'

export function agentRoutes(manager: AdapterManager) {
  const app = new Hono()

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
