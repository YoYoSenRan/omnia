import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { AdapterManager } from './adapter'
import { agentRoutes } from './routes/agents'
import { skillRoutes } from './routes/skills'
import { sessionRoutes } from './routes/sessions'
import { chatRoutes } from './routes/chat'
import { modelRoutes } from './routes/models'
import { cronRoutes } from './routes/cron'
import { workspaceRoutes } from './routes/workspace'
import { sseRoutes } from './routes/sse'
import { connectionRoutes } from './routes/connections'

export function createApp(manager: AdapterManager) {
  const app = new Hono()

  // Middleware
  app.use('*', logger())
  app.use('/api/*', cors())

  // Gateway connection guard (skip status, workspace, events, connections)
  app.use('/api/*', async (c, next) => {
    if (c.req.path === '/api/status') return next()
    if (c.req.path.startsWith('/api/workspace')) return next()
    if (c.req.path.startsWith('/api/events')) return next()
    if (c.req.path.startsWith('/api/connections')) return next()
    const active = manager.getActive()
    if (!active || !active.isConnected()) {
      return c.json({ error: 'Gateway disconnected' }, 503)
    }
    return next()
  })

  // Routes
  app.route('/api/connections', connectionRoutes(manager))
  app.route('/api/agents', agentRoutes(manager))
  app.route('/api/skills', skillRoutes(manager))
  app.route('/api/sessions', sessionRoutes(manager))
  app.route('/api/chat', chatRoutes(manager))
  app.route('/api/models', modelRoutes(manager))
  app.route('/api/cron', cronRoutes(manager))
  app.route('/api/workspace', workspaceRoutes())
  app.route('/api/events', sseRoutes(manager))

  // System status (no Gateway needed)
  app.get('/api/status', (c) => {
    const active = manager.getActive()
    return c.json({
      gateway: active?.getStatus() ?? 'disconnected',
      uptime: process.uptime(),
    })
  })

  // Gateway health (proxied)
  app.get('/api/health', async (c) => {
    const active = manager.getActive()
    if (!active || !active.isConnected()) {
      return c.json({ error: 'Gateway disconnected' }, 503)
    }
    const health = await active.getHealth()
    return c.json(health)
  })

  return app
}
