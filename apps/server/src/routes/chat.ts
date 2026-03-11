import { Hono } from 'hono'
import type { OpenClawAdapter } from '../adapter'

export function chatRoutes(adapter: OpenClawAdapter) {
  const app = new Hono()

  app.post('/send', async (c) => {
    const { agentId, message, sessionId } = await c.req.json<{
      agentId: string
      message: string
      sessionId?: string
    }>()
    const result = await adapter.sendMessage(agentId, message, sessionId)
    return c.json(result)
  })

  app.post('/abort', async (c) => {
    const { agentId } = await c.req.json<{ agentId: string }>()
    const result = await adapter.abortChat(agentId)
    return c.json(result)
  })

  app.get('/history/:sessionId', async (c) => {
    const sessionId = c.req.param('sessionId')
    const history = await adapter.getChatHistory(sessionId)
    return c.json(history)
  })

  return app
}
