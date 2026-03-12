import { Hono } from 'hono'
import { randomUUID } from 'node:crypto'
import type { AdapterManager } from '../adapter'
import {
  getAllConnections,
  getConnection,
  createConnection,
  updateConnection,
  deleteConnection,
  deactivateAll,
} from '../db'

export function connectionRoutes(manager: AdapterManager) {
  const app = new Hono()

  // List all connections with live status
  app.get('/', (c) => {
    const profiles = getAllConnections()
    const liveStatus = manager.getAllStatus()
    const statusMap = new Map(liveStatus.map((s) => [s.id, s]))

    const result = profiles.map((p) => {
      const live = statusMap.get(p.id)
      return {
        ...p,
        token: p.token ? '••••••••' : undefined,
        status: live?.status ?? 'disconnected',
        isActive: live?.isActive ?? false,
      }
    })

    return c.json(result)
  })

  // Create new connection
  app.post('/', async (c) => {
    const body = await c.req.json<{
      name: string
      gatewayUrl: string
      token?: string
    }>()

    const now = new Date().toISOString()
    const profile = {
      id: randomUUID(),
      name: body.name,
      gatewayUrl: body.gatewayUrl,
      token: body.token,
      isActive: false,
      createdAt: now,
      updatedAt: now,
    }

    createConnection(profile)
    return c.json(profile, 201)
  })

  // Update connection
  app.put('/:id', async (c) => {
    const id = c.req.param('id')
    const existing = getConnection(id)
    if (!existing) return c.json({ error: 'Connection not found' }, 404)

    const body = await c.req.json<{
      name?: string
      gatewayUrl?: string
      token?: string
    }>()

    // If connected and URL changed, must disconnect first
    if (body.gatewayUrl && body.gatewayUrl !== existing.gatewayUrl && manager.isConnected(id)) {
      manager.disconnect(id)
    }

    updateConnection(id, body)
    const updated = getConnection(id)
    return c.json(updated)
  })

  // Delete connection
  app.delete('/:id', (c) => {
    const id = c.req.param('id')
    const existing = getConnection(id)
    if (!existing) return c.json({ error: 'Connection not found' }, 404)

    manager.disconnect(id)
    deleteConnection(id)
    return c.json({ ok: true })
  })

  // Connect
  app.post('/:id/connect', async (c) => {
    const id = c.req.param('id')
    const profile = getConnection(id)
    if (!profile) return c.json({ error: 'Connection not found' }, 404)

    try {
      await manager.connect(profile)
      return c.json({ ok: true, status: 'connected' })
    } catch (err) {
      return c.json({ error: (err as Error).message }, 502)
    }
  })

  // Disconnect
  app.post('/:id/disconnect', (c) => {
    const id = c.req.param('id')
    const profile = getConnection(id)
    if (!profile) return c.json({ error: 'Connection not found' }, 404)

    manager.disconnect(id)
    return c.json({ ok: true, status: 'disconnected' })
  })

  // Activate
  app.post('/:id/activate', (c) => {
    const id = c.req.param('id')
    const profile = getConnection(id)
    if (!profile) return c.json({ error: 'Connection not found' }, 404)

    if (!manager.isConnected(id)) {
      return c.json({ error: 'Connection is not connected' }, 400)
    }

    // Update DB: deactivate all, then activate this one
    deactivateAll()
    updateConnection(id, { isActive: true })

    manager.setActive(id)
    return c.json({ ok: true })
  })

  return app
}
