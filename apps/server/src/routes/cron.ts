import { Hono } from 'hono'
import type { OpenClawAdapter } from '../adapter'

export function cronRoutes(adapter: OpenClawAdapter) {
  const app = new Hono()

  app.get('/', async (c) => {
    const jobs = await adapter.listCronJobs()
    return c.json(jobs)
  })

  app.post('/', async (c) => {
    const body = await c.req.json()
    const result = await adapter.addCronJob(body)
    return c.json(result, 201)
  })

  app.post('/:id/run', async (c) => {
    const id = c.req.param('id')
    const result = await adapter.runCronJob(id)
    return c.json(result)
  })

  return app
}
