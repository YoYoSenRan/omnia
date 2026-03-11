import { Hono } from 'hono'
import type { OpenClawAdapter } from '../adapter'

export function modelRoutes(adapter: OpenClawAdapter) {
  const app = new Hono()

  app.get('/', async (c) => {
    const models = await adapter.listModels()
    return c.json(models)
  })

  return app
}
