import { Hono } from 'hono'
import type { OpenClawAdapter } from '../adapter'

export function skillRoutes(adapter: OpenClawAdapter) {
  const app = new Hono()

  app.get('/', async (c) => {
    const catalog = await adapter.getToolsCatalog()
    return c.json(catalog)
  })

  app.post('/install', async (c) => {
    const { url } = await c.req.json<{ url: string }>()
    const result = await adapter.installSkill(url)
    return c.json(result, 201)
  })

  app.put('/:name', async (c) => {
    const name = c.req.param('name')
    const result = await adapter.updateSkill(name)
    return c.json(result)
  })

  return app
}
