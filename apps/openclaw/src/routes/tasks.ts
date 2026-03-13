/**
 * Task 路由
 *
 * 提供任务的 CRUD 操作。
 * 任务支持树形结构（parent_id），可拆解为多个子任务。
 *
 * @module routes/tasks
 */

import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { tasks, auditLogs } from '../db/schema.js'
import { ok } from '../lib/response.js'
import { CODE } from '../lib/code.js'
import { AppError } from '../lib/errors.js'
import { emitEvent } from '../events/bus.js'
import { logger } from '../lib/logger.js'

// ── 内部路由（/api/tasks） ───────────────────────────────

export const taskRoutes = new Hono()

/** GET /api/tasks — 查询所有任务 */
taskRoutes.get('/', async (c) => {
  const rows = await db.select().from(tasks)
  return ok(c, rows)
})

/** GET /api/tasks/:id — 查询单个任务 */
taskRoutes.get('/:id', async (c) => {
  const { id } = c.req.param()
  const [row] = await db.select().from(tasks).where(eq(tasks.id, id))

  if (!row) {
    throw new AppError(404, CODE.TASK_NOT_FOUND, `Task '${id}' not found`)
  }

  return ok(c, row)
})

/** POST /api/tasks — 创建任务 */
taskRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const id = body.id ?? crypto.randomUUID()
  const now = new Date()

  const newTask = {
    id,
    title: body.title,
    description: body.description ?? null,
    status: 'pending' as const,
    assignedTo: body.assignedTo ?? null,
    result: null,
    parentId: body.parentId ?? null,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(tasks).values(newTask)

  /* 记录审计日志 */
  await db.insert(auditLogs).values({
    entityType: 'task',
    entityId: id,
    action: 'created',
    detail: JSON.stringify({ title: body.title, assignedTo: newTask.assignedTo }),
    source: 'user',
  })

  logger.info({ taskId: id, title: body.title }, 'Task created')
  emitEvent('task.created', { taskId: id, title: body.title })

  return ok(c, newTask, 201)
})

/** PUT /api/tasks/:id — 更新任务 */
taskRoutes.put('/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()

  const [existing] = await db.select().from(tasks).where(eq(tasks.id, id))
  if (!existing) {
    throw new AppError(404, CODE.TASK_NOT_FOUND, `Task '${id}' not found`)
  }

  const now = new Date()
  const updates: Record<string, unknown> = { updatedAt: now }

  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.status !== undefined) updates.status = body.status
  if (body.assignedTo !== undefined) updates.assignedTo = body.assignedTo
  if (body.result !== undefined) updates.result = body.result

  /* 任务完成时记录完成时间 */
  if (body.status === 'completed' || body.status === 'failed') {
    updates.completedAt = now
  }

  await db.update(tasks).set(updates).where(eq(tasks.id, id))

  /* 记录审计日志 */
  await db.insert(auditLogs).values({
    entityType: 'task',
    entityId: id,
    action: 'updated',
    detail: JSON.stringify(Object.keys(updates).filter((k) => k !== 'updatedAt')),
    source: 'user',
  })

  logger.info({ taskId: id, status: body.status }, 'Task updated')

  /* 根据状态变更发送不同事件 */
  if (body.status === 'completed') {
    emitEvent('task.completed', { taskId: id })
  } else if (body.status) {
    emitEvent('task.updated', { taskId: id, status: body.status })
  }

  return ok(c, { ...existing, ...updates })
})

/** DELETE /api/tasks/:id — 删除任务 */
taskRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param()

  const [existing] = await db.select().from(tasks).where(eq(tasks.id, id))
  if (!existing) {
    throw new AppError(404, CODE.TASK_NOT_FOUND, `Task '${id}' not found`)
  }

  await db.delete(tasks).where(eq(tasks.id, id))

  await db.insert(auditLogs).values({
    entityType: 'task',
    entityId: id,
    action: 'deleted',
    detail: JSON.stringify({ title: existing.title }),
    source: 'user',
  })

  logger.info({ taskId: id }, 'Task deleted')

  return ok(c, { id })
})

// ── 开放路由（/open/tasks） ──────────────────────────────

export const taskOpenRoutes = new Hono()

/** GET /open/tasks — 查询所有任务（业务侧只读） */
taskOpenRoutes.get('/', async (c) => {
  const rows = await db.select().from(tasks)
  return ok(c, rows)
})

/** GET /open/tasks/:id — 查询单个任务（业务侧只读） */
taskOpenRoutes.get('/:id', async (c) => {
  const { id } = c.req.param()
  const [row] = await db.select().from(tasks).where(eq(tasks.id, id))

  if (!row) {
    throw new AppError(404, CODE.TASK_NOT_FOUND, `Task '${id}' not found`)
  }

  return ok(c, row)
})

/** POST /open/tasks — 业务侧提交任务 */
taskOpenRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const id = body.id ?? crypto.randomUUID()
  const now = new Date()

  const newTask = {
    id,
    title: body.title,
    description: body.description ?? null,
    status: 'pending' as const,
    assignedTo: body.assignedTo ?? null,
    result: null,
    parentId: body.parentId ?? null,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(tasks).values(newTask)

  await db.insert(auditLogs).values({
    entityType: 'task',
    entityId: id,
    action: 'created',
    detail: JSON.stringify({ title: body.title, source: 'service' }),
    source: 'system',
  })

  logger.info({ taskId: id, title: body.title, source: 'open' }, 'Task created via open API')
  emitEvent('task.created', { taskId: id, title: body.title })

  return ok(c, newTask, 201)
})
