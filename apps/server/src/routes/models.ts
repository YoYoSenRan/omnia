import { Hono } from 'hono'
import type { AdapterManager } from '../adapter'

export function modelRoutes(manager: AdapterManager) {
  const app = new Hono()

  app.get('/', async (c) => {
    const models = await manager.getActive()!.listModels()
    return c.json(models)
  })

  return app
}
