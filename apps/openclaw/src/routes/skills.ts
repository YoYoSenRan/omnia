/**
 * Skill 路由
 *
 * 提供 Skill 的 CRUD 操作。
 * Skill 是 Agent 可调用的能力单元。
 *
 * @module routes/skills
 */

import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { skills, auditLogs } from '../db/schema.js'
import { ok } from '../lib/response.js'
import { CODE } from '../lib/code.js'
import { AppError } from '../lib/errors.js'
import { logger } from '../lib/logger.js'

// ── 内部路由（/api/skills） ──────────────────────────────

export const skillRoutes = new Hono()

/** GET /api/skills — 查询所有 Skill */
skillRoutes.get('/', async (c) => {
  const rows = await db.select().from(skills)
  return ok(c, rows)
})

/** GET /api/skills/:id — 查询单个 Skill */
skillRoutes.get('/:id', async (c) => {
  const { id } = c.req.param()
  const [row] = await db.select().from(skills).where(eq(skills.id, id))

  if (!row) {
    throw new AppError(404, CODE.SKILL_NOT_FOUND, `Skill '${id}' not found`)
  }

  return ok(c, row)
})

/** POST /api/skills — 创建 Skill */
skillRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const id = body.id ?? crypto.randomUUID()
  const now = new Date()

  const newSkill = {
    id,
    name: body.name,
    description: body.description ?? null,
    source: body.source ?? 'local',
    contentHash: body.contentHash ?? null,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(skills).values(newSkill)

  await db.insert(auditLogs).values({
    entityType: 'skill',
    entityId: id,
    action: 'created',
    detail: JSON.stringify({ name: body.name }),
    source: 'user',
  })

  logger.info({ skillId: id, name: body.name }, 'Skill created')

  return ok(c, newSkill, 201)
})

/** PUT /api/skills/:id — 更新 Skill */
skillRoutes.put('/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()

  const [existing] = await db.select().from(skills).where(eq(skills.id, id))
  if (!existing) {
    throw new AppError(404, CODE.SKILL_NOT_FOUND, `Skill '${id}' not found`)
  }

  const updates = {
    ...(body.name !== undefined && { name: body.name }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.contentHash !== undefined && { contentHash: body.contentHash }),
    updatedAt: new Date(),
  }

  await db.update(skills).set(updates).where(eq(skills.id, id))

  await db.insert(auditLogs).values({
    entityType: 'skill',
    entityId: id,
    action: 'updated',
    detail: JSON.stringify(Object.keys(updates).filter((k) => k !== 'updatedAt')),
    source: 'user',
  })

  logger.info({ skillId: id }, 'Skill updated')

  return ok(c, { ...existing, ...updates })
})

/** DELETE /api/skills/:id — 删除 Skill */
skillRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param()

  const [existing] = await db.select().from(skills).where(eq(skills.id, id))
  if (!existing) {
    throw new AppError(404, CODE.SKILL_NOT_FOUND, `Skill '${id}' not found`)
  }

  await db.delete(skills).where(eq(skills.id, id))

  await db.insert(auditLogs).values({
    entityType: 'skill',
    entityId: id,
    action: 'deleted',
    detail: JSON.stringify({ name: existing.name }),
    source: 'user',
  })

  logger.info({ skillId: id, name: existing.name }, 'Skill deleted')

  return ok(c, { id })
})

// ── 开放路由（/open/skills） ─────────────────────────────

export const skillOpenRoutes = new Hono()

/** GET /open/skills — 查询所有 Skill（业务侧只读） */
skillOpenRoutes.get('/', async (c) => {
  const rows = await db.select().from(skills)
  return ok(c, rows)
})

/** GET /open/skills/:id — 查询单个 Skill（业务侧只读） */
skillOpenRoutes.get('/:id', async (c) => {
  const { id } = c.req.param()
  const [row] = await db.select().from(skills).where(eq(skills.id, id))

  if (!row) {
    throw new AppError(404, CODE.SKILL_NOT_FOUND, `Skill '${id}' not found`)
  }

  return ok(c, row)
})
