/**
 * Task Service
 *
 * @module services/task
 */

import { taskRepo } from '../db/repo/task.js'
import { activityRepo } from '../db/repo/activity.js'
import { emitEvent } from '../events/bus.js'
import { AppError } from '../http/errors.js'
import { CODE } from '../http/code.js'
import { generateId } from '../utils/id.js'
import { logger } from '../utils/logger.js'
import type { TaskInsert, TaskRow } from '../db/schema.js'

/** 合法的状态流转 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  inbox: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['review', 'done', 'failed', 'cancelled'],
  review: ['done', 'in_progress', 'failed'],
  done: [],
  failed: ['inbox'],
  cancelled: ['inbox'],
}

export const taskService = {
  async list(): Promise<TaskRow[]> {
    return taskRepo.findAll()
  },

  async getById(id: string): Promise<TaskRow> {
    const task = await taskRepo.findById(id)
    if (!task) {
      throw new AppError(404, CODE.TASK_NOT_FOUND, `Task '${id}' not found`)
    }
    return task
  },

  async create(data: {
    id?: string
    title: string
    description?: string | null
    priority?: number
    assignedTo?: string | null
    parentId?: string | null
    tags?: string[] | null
  }, source: string = 'user'): Promise<TaskRow> {
    const id = data.id ?? generateId()
    const now = new Date()

    const insert: TaskInsert = {
      id,
      title: data.title,
      description: data.description ?? null,
      status: data.assignedTo ? 'assigned' : 'inbox',
      priority: data.priority ?? 3,
      assignedTo: data.assignedTo ?? null,
      parentId: data.parentId ?? null,
      tags: data.tags ?? null,
      createdAt: now,
      updatedAt: now,
    }

    const task = await taskRepo.create(insert)

    await activityRepo.log('task', id, 'created', source, { title: data.title, assignedTo: insert.assignedTo })
    logger.info({ taskId: id, title: data.title }, 'Task created')
    emitEvent('task.created', { taskId: id, title: data.title })

    return task
  },

  async update(id: string, data: Partial<{
    title: string
    description: string | null
    status: string
    priority: number
    assignedTo: string | null
    result: string | null
    tags: string[] | null
  }>): Promise<TaskRow> {
    const existing = await this.getById(id)

    // 如果有状态变更，校验流转合法性
    if (data.status && data.status !== existing.status) {
      const allowed = VALID_TRANSITIONS[existing.status]
      if (allowed && !allowed.includes(data.status)) {
        throw new AppError(
          400,
          CODE.TASK_STATUS_INVALID,
          `Cannot transition from '${existing.status}' to '${data.status}'`,
        )
      }
    }

    const updates: Partial<TaskInsert> = { ...data }

    // 任务完成时记录完成时间
    if (data.status === 'done' || data.status === 'failed') {
      updates.completedAt = new Date()
    }

    const updated = await taskRepo.update(id, updates)
    if (!updated) {
      throw new AppError(500, CODE.INTERNAL_ERROR, `Failed to update task '${id}'`)
    }

    await activityRepo.log('task', id, 'updated', 'user', { fields: Object.keys(data) })
    logger.info({ taskId: id, status: data.status }, 'Task updated')

    if (data.status === 'done') {
      emitEvent('task.completed', { taskId: id })
    } else if (data.status) {
      emitEvent('task.updated', { taskId: id, status: data.status })
    }

    return updated
  },

  async remove(id: string): Promise<void> {
    const existing = await this.getById(id)
    await taskRepo.remove(id)

    await activityRepo.log('task', id, 'deleted', 'user', { title: existing.title })
    logger.info({ taskId: id }, 'Task deleted')
  },

  async assign(taskId: string, agentId: string): Promise<TaskRow> {
    return this.update(taskId, { assignedTo: agentId, status: 'assigned' })
  },

  async complete(taskId: string, result?: string): Promise<TaskRow> {
    return this.update(taskId, { status: 'done', result: result ?? null })
  },

  async fail(taskId: string, error?: string): Promise<TaskRow> {
    return this.update(taskId, { status: 'failed', result: error ?? null })
  },
}
