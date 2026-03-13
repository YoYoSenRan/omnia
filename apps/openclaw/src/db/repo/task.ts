/**
 * Task 数据访问层
 *
 * @module db/repo/task
 */

import { eq } from 'drizzle-orm'
import { db } from '../index.js'
import { tasks, type TaskInsert, type TaskRow } from '../schema.js'

export const taskRepo = {
  async findAll(): Promise<TaskRow[]> {
    return db.select().from(tasks)
  },

  async findById(id: string): Promise<TaskRow | undefined> {
    const [row] = await db.select().from(tasks).where(eq(tasks.id, id))
    return row
  },

  async findByParentId(parentId: string): Promise<TaskRow[]> {
    return db.select().from(tasks).where(eq(tasks.parentId, parentId))
  },

  async findByAssignee(agentId: string): Promise<TaskRow[]> {
    return db.select().from(tasks).where(eq(tasks.assignedTo, agentId))
  },

  async create(data: TaskInsert): Promise<TaskRow> {
    const [row] = await db.insert(tasks).values(data).returning()
    return row
  },

  async update(id: string, data: Partial<TaskInsert>): Promise<TaskRow | undefined> {
    const [row] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning()
    return row
  },

  async remove(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning()
    return result.length > 0
  },
}
