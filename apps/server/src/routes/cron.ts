import { Hono } from 'hono'
import type { AdapterManager } from '../adapter'

export function cronRoutes(manager: AdapterManager) {
  const app = new Hono()

  app.get('/', async (c) => {
    const health = await manager.getActive()!.getHealth()
    return c.json(health)
  })

  return app
}
