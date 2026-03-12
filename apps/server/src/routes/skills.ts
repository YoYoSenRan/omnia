import { Hono } from 'hono'
import type { AdapterManager } from '../adapter'

export function skillRoutes(manager: AdapterManager) {
  const app = new Hono()

  app.get('/', async (c) => {
    const catalog = await manager.getActive()!.getToolsCatalog()
    return c.json(catalog)
  })

  return app
}
