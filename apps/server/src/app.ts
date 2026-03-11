import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { OpenClawAdapter } from './adapter'
import { agentRoutes } from './routes/agents'
import { skillRoutes } from './routes/skills'
import { sessionRoutes } from './routes/sessions'
import { chatRoutes } from './routes/chat'
import { modelRoutes } from './routes/models'
import { cronRoutes } from './routes/cron'
import { workspaceRoutes } from './routes/workspace'
import { sseRoutes } from './routes/sse'

export function createApp(adapter: OpenClawAdapter) {
  const app = new Hono()

  // Middleware
  app.use('*', logger())
  app.use('/api/*', cors())

  // Gateway connection guard (skip /api/status and /api/workspace)
  app.use('/api/*', async (c, next) => {
    if (c.req.path === '/api/status') return next()
    if (c.req.path.startsWith('/api/workspace')) return next()
    if (!adapter.isConnected()) {
      return c.json({ error: 'Gateway disconnected' }, 503)
    }
    return next()
  })

  // Routes
  app.route('/api/agents', agentRoutes(adapter))
  app.route('/api/skills', skillRoutes(adapter))
  app.route('/api/sessions', sessionRoutes(adapter))
  app.route('/api/chat', chatRoutes(adapter))
  app.route('/api/models', modelRoutes(adapter))
  app.route('/api/cron', cronRoutes(adapter))
  app.route('/api/workspace', workspaceRoutes())
  app.route('/api/events', sseRoutes(adapter))

  // System status
  app.get('/api/status', (c) => {
    return c.json({
      gateway: adapter.getStatus(),
      uptime: process.uptime(),
    })
  })

  return app
}
