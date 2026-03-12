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
import { ok, fail } from '../lib/response'

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

    return ok(c, result)
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
    return ok(c, profile, 201)
  })

  // Update connection
  app.put('/:id', async (c) => {
    const id = c.req.param('id')
    const existing = getConnection(id)
    if (!existing) return fail(c, 404, 'NOT_FOUND', 'Connection not found')

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
    return ok(c, updated)
  })

  // Delete connection
  app.delete('/:id', (c) => {
    const id = c.req.param('id')
    const existing = getConnection(id)
    if (!existing) return fail(c, 404, 'NOT_FOUND', 'Connection not found')

    manager.disconnect(id)
    deleteConnection(id)
    return ok(c, null)
  })

  // Connect
  app.post('/:id/connect', async (c) => {
    const id = c.req.param('id')
    const profile = getConnection(id)
    if (!profile) return fail(c, 404, 'NOT_FOUND', 'Connection not found')

    try {
      await manager.connect(profile)
      return ok(c, { status: 'connected' })
    } catch (err) {
      return fail(c, 502, 'GATEWAY_ERROR', (err as Error).message)
    }
  })

  // Disconnect
  app.post('/:id/disconnect', (c) => {
    const id = c.req.param('id')
    const profile = getConnection(id)
    if (!profile) return fail(c, 404, 'NOT_FOUND', 'Connection not found')

    manager.disconnect(id)
    return ok(c, { status: 'disconnected' })
  })

  // Activate
  app.post('/:id/activate', (c) => {
    const id = c.req.param('id')
    const profile = getConnection(id)
    if (!profile) return fail(c, 404, 'NOT_FOUND', 'Connection not found')

    if (!manager.isConnected(id)) {
      return fail(c, 400, 'INVALID_REQUEST', 'Connection is not connected')
    }

    // Update DB: deactivate all, then activate this one
    deactivateAll()
    updateConnection(id, { isActive: true })

    manager.setActive(id)
    return ok(c, null)
  })

  return app
}
