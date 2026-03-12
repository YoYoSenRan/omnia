import { Hono } from 'hono'
import { randomUUID } from 'node:crypto'
import type { AdapterManager } from '../adapter'
import {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  deactivateAllProjects,
} from '../db'
import { ok, fail } from '../lib/response'

export function projectRoutes(manager: AdapterManager) {
  const app = new Hono()

  // List all projects with live status
  app.get('/', (c) => {
    const items = getAllProjects()
    const liveStatus = manager.getAllStatus()
    const statusMap = new Map(liveStatus.map((s) => [s.id, s]))

    const result = items.map((p) => {
      const live = statusMap.get(p.id)
      return {
        ...p,
        token: p.token ? '••••••••' : undefined,
        status: live?.status ?? 'disconnected',
      }
    })

    return ok(c, result)
  })

  // Create project
  app.post('/', async (c) => {
    const body = await c.req.json<{
      name: string
      gatewayUrl: string
      token?: string
    }>()

    const now = new Date().toISOString()
    const project = {
      id: randomUUID(),
      name: body.name,
      gatewayUrl: body.gatewayUrl,
      token: body.token,
      isLastActive: false,
      createdAt: now,
      updatedAt: now,
    }

    createProject(project)
    return ok(c, project, 201)
  })

  // Update project
  app.put('/:id', async (c) => {
    const id = c.req.param('id')
    const existing = getProject(id)
    if (!existing) return fail(c, 404, 'NOT_FOUND', 'Project not found')

    const body = await c.req.json<{
      name?: string
      gatewayUrl?: string
      token?: string
    }>()

    // If connected and URL changed, must disconnect first
    if (body.gatewayUrl && body.gatewayUrl !== existing.gatewayUrl && manager.isConnected(id)) {
      manager.disconnect(id)
    }

    updateProject(id, body)
    const updated = getProject(id)
    return ok(c, updated)
  })

  // Delete project
  app.delete('/:id', (c) => {
    const id = c.req.param('id')
    const existing = getProject(id)
    if (!existing) return fail(c, 404, 'NOT_FOUND', 'Project not found')

    manager.disconnect(id)
    deleteProject(id)
    return ok(c, null)
  })

  // Connect
  app.post('/:id/connect', async (c) => {
    const id = c.req.param('id')
    const project = getProject(id)
    if (!project) return fail(c, 404, 'NOT_FOUND', 'Project not found')

    try {
      // Pass project as ConnectionProfile-compatible object
      await manager.connect({
        id: project.id,
        name: project.name,
        gatewayUrl: project.gatewayUrl,
        token: project.token,
        isActive: project.isLastActive,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })
      return ok(c, { status: 'connected' })
    } catch (err) {
      return fail(c, 502, 'GATEWAY_ERROR', (err as Error).message)
    }
  })

  // Disconnect
  app.post('/:id/disconnect', (c) => {
    const id = c.req.param('id')
    const project = getProject(id)
    if (!project) return fail(c, 404, 'NOT_FOUND', 'Project not found')

    manager.disconnect(id)
    return ok(c, { status: 'disconnected' })
  })

  // Activate — set as last active + connect + set as active adapter
  app.post('/:id/activate', async (c) => {
    const id = c.req.param('id')
    const project = getProject(id)
    if (!project) return fail(c, 404, 'NOT_FOUND', 'Project not found')

    // Disconnect all other connections, connect this one
    manager.disconnectAll()

    try {
      await manager.connect({
        id: project.id,
        name: project.name,
        gatewayUrl: project.gatewayUrl,
        token: project.token,
        isActive: true,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })
      manager.setActive(id)
    } catch (err) {
      return fail(c, 502, 'GATEWAY_ERROR', (err as Error).message)
    }

    // Update DB: deactivate all, then mark this one
    deactivateAllProjects()
    updateProject(id, { isLastActive: true })

    return ok(c, null)
  })

  return app
}
