import { Hono } from 'hono'
import type { AdapterManager } from '../adapter'

export function chatRoutes(manager: AdapterManager) {
  const app = new Hono()

  app.post('/send', async (c) => {
    const body = await c.req.json<{
      to: string
      message: string
      channel?: string
    }>()
    const result = await manager.getActive()!.sendChat(body)
    return c.json(result)
  })

  app.get('/history/:sessionId', async (c) => {
    const sessionId = c.req.param('sessionId')
    const history = await manager.getActive()!.getChatHistory(sessionId)
    return c.json(history)
  })

  return app
}
