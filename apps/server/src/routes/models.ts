import { Hono } from 'hono'
import type { AdapterManager } from '../adapter'
import { ok } from '../lib/response'

export function modelRoutes(manager: AdapterManager) {
  const app = new Hono()

  app.get('/', async (c) => {
    const models = await manager.getActive()!.listModels()
    return ok(c, models)
  })

  return app
}
