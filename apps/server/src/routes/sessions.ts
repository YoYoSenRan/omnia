import { Hono } from 'hono'
import type { AdapterManager } from '../adapter'

export function sessionRoutes(manager: AdapterManager) {
  const app = new Hono()

  // Sessions are managed through the status/health endpoints for now
  app.get('/', async (c) => {
    const status = await manager.getActive()!.getStatus_()
    return c.json(status)
  })

  return app
}
