/**
 * Session 路由（薄壳）
 *
 * @module routes/sessions
 */

import { Hono } from 'hono'
import { sessionService } from '../services/session.js'
import { ok } from '../http/response.js'

// ── 内部路由（/api/sessions） ────────────────────────────

export const sessionRoutes = new Hono()

sessionRoutes.get('/', async (c) => {
  const sessions = await sessionService.list()
  return ok(c, sessions)
})

sessionRoutes.get('/:id', async (c) => {
  const session = await sessionService.getById(c.req.param('id'))
  return ok(c, session)
})

sessionRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const session = await sessionService.create(body)
  return ok(c, session, 201)
})

sessionRoutes.put('/:id/close', async (c) => {
  const session = await sessionService.close(c.req.param('id'))
  return ok(c, session)
})

// ── 开放路由（/open/sessions） ───────────────────────────

export const sessionOpenRoutes = new Hono()

sessionOpenRoutes.get('/', async (c) => {
  const sessions = await sessionService.list()
  return ok(c, sessions)
})

sessionOpenRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const session = await sessionService.create(body, 'system')
  return ok(c, session, 201)
})
