import { Hono } from 'hono'
import type { AdapterManager } from '../adapter'
import { ok } from '../lib/response'

export function skillRoutes(manager: AdapterManager) {
  const app = new Hono()

  app.get('/', async (c) => {
    const catalog = await manager.getActive()!.getToolsCatalog()
    return ok(c, catalog)
  })

  return app
}
