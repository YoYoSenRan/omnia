/**
 * Agent 路由
 *
 * 提供 Agent 的 CRUD 操作和同步功能。
 * 数据库优先模式——所有操作先写本地数据库，再尝试同步网关。
 *
 * 内部路由（/api/agents）：console 使用，全功能
 * 开放路由（/open/agents）：server 使用，只读查询
 *
 * @module routes/agents
 */

import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { agents, auditLogs } from '../db/schema.js'
import { ok } from '../lib/response.js'
import { CODE } from '../lib/code.js'
import { AppError } from '../lib/errors.js'
import { emitEvent } from '../events/bus.js'
import { logger } from '../lib/logger.js'

// ── 内部路由（/api/agents） ──────────────────────────────

export const agentRoutes = new Hono()

/** GET /api/agents — 查询所有 Agent */
agentRoutes.get('/', async (c) => {
  const rows = await db.select().from(agents)
  return ok(c, rows)
})

/** GET /api/agents/:id — 查询单个 Agent 详情 */
agentRoutes.get('/:id', async (c) => {
  const { id } = c.req.param()
  const [row] = await db.select().from(agents).where(eq(agents.id, id))

  if (!row) {
    throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${id}' not found`)
  }

  return ok(c, row)
})

/** POST /api/agents — 创建新 Agent */
agentRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const now = new Date()
  const id = body.id ?? crypto.randomUUID()

  const newAgent = {
    id,
    name: body.name,
    emoji: body.emoji ?? null,
    model: body.model ?? null,
    workspace: body.workspace ?? null,
    status: 'idle' as const,
    source: body.source ?? 'local',
    sourceRef: body.sourceRef ?? null,
    soul: body.soul ?? null,
    config: body.config ?? null,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(agents).values(newAgent)

  /* 记录审计日志 */
  await db.insert(auditLogs).values({
    entityType: 'agent',
    entityId: id,
    action: 'created',
    detail: JSON.stringify({ name: body.name, source: newAgent.source }),
    source: 'user',
  })

  logger.info({ agentId: id, name: body.name }, 'Agent created')
  emitEvent('agent.status', { agentId: id, status: 'idle' })

  return ok(c, newAgent, 201)
})

/** PUT /api/agents/:id — 更新 Agent */
agentRoutes.put('/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()

  /* 检查 Agent 是否存在 */
  const [existing] = await db.select().from(agents).where(eq(agents.id, id))
  if (!existing) {
    throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${id}' not found`)
  }

  const updates = {
    ...(body.name !== undefined && { name: body.name }),
    ...(body.emoji !== undefined && { emoji: body.emoji }),
    ...(body.model !== undefined && { model: body.model }),
    ...(body.workspace !== undefined && { workspace: body.workspace }),
    ...(body.status !== undefined && { status: body.status }),
    ...(body.soul !== undefined && { soul: body.soul }),
    ...(body.config !== undefined && { config: body.config }),
    updatedAt: new Date(),
  }

  await db.update(agents).set(updates).where(eq(agents.id, id))

  /* 记录审计日志 */
  await db.insert(auditLogs).values({
    entityType: 'agent',
    entityId: id,
    action: 'updated',
    detail: JSON.stringify(Object.keys(updates).filter((k) => k !== 'updatedAt')),
    source: 'user',
  })

  logger.info({ agentId: id }, 'Agent updated')

  /* 如果状态变更，发送事件 */
  if (body.status && body.status !== existing.status) {
    emitEvent('agent.status', { agentId: id, status: body.status })
  }

  return ok(c, { ...existing, ...updates })
})

/** DELETE /api/agents/:id — 删除 Agent */
agentRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param()

  const [existing] = await db.select().from(agents).where(eq(agents.id, id))
  if (!existing) {
    throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${id}' not found`)
  }

  await db.delete(agents).where(eq(agents.id, id))

  /* 记录审计日志 */
  await db.insert(auditLogs).values({
    entityType: 'agent',
    entityId: id,
    action: 'deleted',
    detail: JSON.stringify({ name: existing.name }),
    source: 'user',
  })

  logger.info({ agentId: id, name: existing.name }, 'Agent deleted')

  return ok(c, { id })
})

/** GET /api/agents/:id/soul — 读取 Agent 的 Soul 内容 */
agentRoutes.get('/:id/soul', async (c) => {
  const { id } = c.req.param()
  const [row] = await db.select().from(agents).where(eq(agents.id, id))

  if (!row) {
    throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${id}' not found`)
  }

  return ok(c, { soul: row.soul ?? '' })
})

/** PUT /api/agents/:id/soul — 更新 Agent 的 Soul 内容 */
agentRoutes.put('/:id/soul', async (c) => {
  const { id } = c.req.param()
  const { soul } = await c.req.json()

  const [existing] = await db.select().from(agents).where(eq(agents.id, id))
  if (!existing) {
    throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${id}' not found`)
  }

  await db
    .update(agents)
    .set({ soul, updatedAt: new Date() })
    .where(eq(agents.id, id))

  /* 记录审计日志 */
  await db.insert(auditLogs).values({
    entityType: 'agent',
    entityId: id,
    action: 'updated',
    detail: JSON.stringify({ field: 'soul' }),
    source: 'user',
  })

  logger.info({ agentId: id }, 'Agent soul updated')

  return ok(c, { id, soul })
})

/** GET /api/agents/:id/logs — 查询 Agent 的审计日志 */
agentRoutes.get('/:id/logs', async (c) => {
  const { id } = c.req.param()
  const limit = Number(c.req.query('limit') ?? 50)

  const logs = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.entityId, id))
    .orderBy(auditLogs.createdAt)
    .limit(limit)

  return ok(c, logs)
})

// ── 开放路由（/open/agents） ─────────────────────────────

export const agentOpenRoutes = new Hono()

/** GET /open/agents — 查询所有 Agent（业务侧只读） */
agentOpenRoutes.get('/', async (c) => {
  const rows = await db.select().from(agents)
  return ok(c, rows)
})

/** GET /open/agents/:id — 查询单个 Agent（业务侧只读） */
agentOpenRoutes.get('/:id', async (c) => {
  const { id } = c.req.param()
  const [row] = await db.select().from(agents).where(eq(agents.id, id))

  if (!row) {
    throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${id}' not found`)
  }

  return ok(c, row)
})
