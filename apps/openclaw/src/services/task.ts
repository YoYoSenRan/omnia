/**
 * Task Service
 *
 * @module services/task
 */

import { taskRepo } from "../db/repo/task.js"
import { emitEvent } from "../events/bus.js"
import { AppError } from "../http/errors.js"
import { CODE } from "../http/code.js"
import { generateId } from "../utils/id.js"
import { logger } from "../utils/logger.js"
import { BaseService } from "./base.js"
import type { TaskInsert, TaskRow } from "../db/schema/index.js"
import type { TaskCreateInput, TaskUpdateInput } from "../validators/task.js"

/** 合法的状态流转 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  inbox: ["assigned", "cancelled"],
  assigned: ["in_progress", "cancelled"],
  in_progress: ["review", "done", "failed", "cancelled"],
  review: ["done", "in_progress", "failed"],
  done: [],
  failed: ["inbox"],
  cancelled: ["inbox"],
}

class TaskService extends BaseService<TaskRow, TaskInsert, TaskCreateInput, TaskUpdateInput> {
  constructor() {
    super({
      entity: "task",
      notFoundCode: CODE.TASK_NOT_FOUND,
      repo: taskRepo,
      logger: logger.child({ module: "task" }),
    })
  }

  protected toInsert(data: TaskCreateInput): TaskInsert {
    const now = new Date()
    return {
      id: data.id ?? generateId(),
      title: data.title,
      description: data.description ?? null,
      status: data.assignedTo ? "assigned" : "inbox",
      priority: data.priority ?? 3,
      assignedTo: data.assignedTo ?? null,
      parentId: data.parentId ?? null,
      tags: data.tags ?? null,
      createdAt: now,
      updatedAt: now,
    }
  }

  async update(id: string, data: TaskUpdateInput, source: string = "user"): Promise<TaskRow> {
    const existing = await this.getById(id)

    // 状态变更校验
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

    // 完成时记录完成时间
    const updates: Partial<TaskInsert> = { ...data }
    if (data.status === "done" || data.status === "failed") {
      updates.completedAt = new Date()
    }

    // 直接走 repo，不调 super.update，因为已经 getById 并需要自定义 updates
    const updated = await this.repo.update(id, updates)
    if (!updated) {
      throw new AppError(500, CODE.INTERNAL_ERROR, `Failed to update task '${id}'`)
    }

    const { activityRepo } = await import("../db/repo/activity.js")
    await activityRepo.log("task", id, "updated", source, this.updateDetail(data))
    this.logger.info({ taskId: id, status: data.status }, "Task updated")

    if (data.status === "done") {
      emitEvent("task.completed", { taskId: id })
    } else if (data.status) {
      emitEvent("task.updated", { taskId: id, status: data.status })
    }

    return updated
  }

  protected afterCreate(row: TaskRow, data: TaskCreateInput): void {
    emitEvent("task.created", { taskId: row.id, title: data.title })
  }

  protected createDetail(data: TaskCreateInput): Record<string, unknown> {
    return { title: data.title, assignedTo: data.assignedTo ?? null }
  }

  protected removeDetail(existing: TaskRow): Record<string, unknown> {
    return { title: existing.title }
  }

  // ── 独有方法 ─────────────────────────────────────────

  async assign(taskId: string, agentId: string): Promise<TaskRow> {
    return this.update(taskId, { assignedTo: agentId, status: "assigned" })
  }

  async complete(taskId: string, result?: string): Promise<TaskRow> {
    return this.update(taskId, { status: "done", result: result ?? null })
  }

  async fail(taskId: string, error?: string): Promise<TaskRow> {
    return this.update(taskId, { status: "failed", result: error ?? null })
  }
}

export const taskService = new TaskService()
