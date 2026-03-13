/**
 * Session 路由
 *
 * 提供会话的创建、查询和关闭功能。
 * 每个会话关联一个 Agent，记录交互过程。
 *
 * @module routes/sessions
 */

import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { sessions, agents, auditLogs } from '../db/schema.js'
import { ok } from '../lib/response.js'
import { CODE } from '../lib/code.js'
import { AppError } from '../lib/errors.js'
import { emitEvent } from '../events/bus.js'
import { logger } from '../lib/logger.js'

// ── 内部路由（/api/sessions） ────────────────────────────

export const sessionRoutes = new Hono()

/** GET /api/sessions — 查询所有会话 */
sessionRoutes.get('/', async (c) => {
  const rows = await db.select().from(sessions)
  return ok(c, rows)
})

/** GET /api/sessions/:id — 查询单个会话 */
sessionRoutes.get('/:id', async (c) => {
  const { id } = c.req.param()
  const [row] = await db.select().from(sessions).where(eq(sessions.id, id))

  if (!row) {
    throw new AppError(404, CODE.SESSION_NOT_FOUND, `Session '${id}' not found`)
  }

  return ok(c, row)
})

/** POST /api/sessions — 创建会话 */
sessionRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const id = body.id ?? crypto.randomUUID()

  /* 验证关联的 Agent 存在 */
  const [agent] = await db.select().from(agents).where(eq(agents.id, body.agentId))
  if (!agent) {
    throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${body.agentId}' not found`)
  }

  const newSession = {
    id,
    agentId: body.agentId,
    status: 'open' as const,
    createdAt: new Date(),
  }

  await db.insert(sessions).values(newSession)

  await db.insert(auditLogs).values({
    entityType: 'session',
    entityId: id,
    action: 'created',
    detail: JSON.stringify({ agentId: body.agentId }),
    source: 'user',
  })

  logger.info({ sessionId: id, agentId: body.agentId }, 'Session created')
  emitEvent('session.created', { sessionId: id, agentId: body.agentId })

  return ok(c, newSession, 201)
})

/** PUT /api/sessions/:id/close — 关闭会话 */
sessionRoutes.put('/:id/close', async (c) => {
  const { id } = c.req.param()

  const [existing] = await db.select().from(sessions).where(eq(sessions.id, id))
  if (!existing) {
    throw new AppError(404, CODE.SESSION_NOT_FOUND, `Session '${id}' not found`)
  }

  if (existing.status === 'closed') {
    throw new AppError(409, CODE.SESSION_CLOSED, `Session '${id}' is already closed`)
  }

  await db
    .update(sessions)
    .set({ status: 'closed', closedAt: new Date() })
    .where(eq(sessions.id, id))

  await db.insert(auditLogs).values({
    entityType: 'session',
    entityId: id,
    action: 'updated',
    detail: JSON.stringify({ status: 'closed' }),
    source: 'user',
  })

  logger.info({ sessionId: id }, 'Session closed')

  return ok(c, { id, status: 'closed' })
})

// ── 开放路由（/open/sessions） ───────────────────────────

export const sessionOpenRoutes = new Hono()

/** GET /open/sessions — 查询所有会话（业务侧只读） */
sessionOpenRoutes.get('/', async (c) => {
  const rows = await db.select().from(sessions)
  return ok(c, rows)
})

/** POST /open/sessions — 业务侧创建会话 */
sessionOpenRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const id = body.id ?? crypto.randomUUID()

  /* 验证关联的 Agent 存在 */
  const [agent] = await db.select().from(agents).where(eq(agents.id, body.agentId))
  if (!agent) {
    throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${body.agentId}' not found`)
  }

  const newSession = {
    id,
    agentId: body.agentId,
    status: 'open' as const,
    createdAt: new Date(),
  }

  await db.insert(sessions).values(newSession)

  await db.insert(auditLogs).values({
    entityType: 'session',
    entityId: id,
    action: 'created',
    detail: JSON.stringify({ agentId: body.agentId, source: 'service' }),
    source: 'system',
  })

  logger.info({ sessionId: id, agentId: body.agentId, source: 'open' }, 'Session created via open API')
  emitEvent('session.created', { sessionId: id, agentId: body.agentId })

  return ok(c, newSession, 201)
})
