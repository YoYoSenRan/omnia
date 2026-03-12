import { Hono } from 'hono'
import type { AdapterManager } from '../adapter'
import { ok } from '../lib/response'

export function cronRoutes(manager: AdapterManager) {
  const app = new Hono()

  app.get('/', async (c) => {
    const health = await manager.getActive()!.getHealth()
    return ok(c, health)
  })

  return app
}
