/**
 * Task 路由（薄壳）
 *
 * @module routes/tasks
 */

import { Hono } from 'hono'
import { taskService } from '../services/task.js'
import { ok } from '../http/response.js'

// ── 内部路由（/api/tasks） ───────────────────────────────

export const taskRoutes = new Hono()

taskRoutes.get('/', async (c) => {
  const tasks = await taskService.list()
  return ok(c, tasks)
})

taskRoutes.get('/:id', async (c) => {
  const task = await taskService.getById(c.req.param('id'))
  return ok(c, task)
})

taskRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const task = await taskService.create(body)
  return ok(c, task, 201)
})

taskRoutes.put('/:id', async (c) => {
  const body = await c.req.json()
  const task = await taskService.update(c.req.param('id'), body)
  return ok(c, task)
})

taskRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param()
  await taskService.remove(id)
  return ok(c, { id })
})

// ── 开放路由（/open/tasks） ──────────────────────────────

export const taskOpenRoutes = new Hono()

taskOpenRoutes.get('/', async (c) => {
  const tasks = await taskService.list()
  return ok(c, tasks)
})

taskOpenRoutes.get('/:id', async (c) => {
  const task = await taskService.getById(c.req.param('id'))
  return ok(c, task)
})

taskOpenRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const task = await taskService.create(body, 'system')
  return ok(c, task, 201)
})
