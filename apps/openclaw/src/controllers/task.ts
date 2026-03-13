/**
 * Task Controller
 *
 * @module controllers/task
 */

import type { Context } from "hono"
import { taskService } from "../services/task.js"
import { ok } from "../http/response.js"
import { TaskCreateSchema, TaskUpdateSchema } from "../validators/task.js"

export const taskController = {
  list: async (c: Context) => {
    const tasks = await taskService.list()
    return ok(c, tasks)
  },

  getById: async (c: Context) => {
    const task = await taskService.getById(c.req.param("id")!)
    return ok(c, task)
  },

  create: async (c: Context) => {
    const body = TaskCreateSchema.parse(await c.req.json())
    const task = await taskService.create(body)
    return ok(c, task, 201)
  },

  /** 开放路由创建（source = system） */
  createFromOpen: async (c: Context) => {
    const body = TaskCreateSchema.parse(await c.req.json())
    const task = await taskService.create(body, "system")
    return ok(c, task, 201)
  },

  update: async (c: Context) => {
    const body = TaskUpdateSchema.parse(await c.req.json())
    const task = await taskService.update(c.req.param("id")!, body)
    return ok(c, task)
  },

  remove: async (c: Context) => {
    const { id } = c.req.param()
    await taskService.remove(id)
    return ok(c, { id })
  },
}
