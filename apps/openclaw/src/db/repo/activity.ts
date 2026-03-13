/**
 * Activity 数据访问层
 *
 * @module db/repo/activity
 */

import { eq, and, desc } from "drizzle-orm"
import { db } from "../index.js"
import { activities, type ActivityInsert, type ActivityRow } from "../schema/index.js"

export const activityRepo = {
  async findByEntity(entityType: string, entityId: string, limit = 50): Promise<ActivityRow[]> {
    return db
      .select()
      .from(activities)
      .where(and(eq(activities.entityType, entityType), eq(activities.entityId, entityId)))
      .orderBy(desc(activities.createdAt))
      .limit(limit)
  },

  async findRecent(limit = 50): Promise<ActivityRow[]> {
    return db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit)
  },

  async create(data: Omit<ActivityInsert, "id" | "createdAt">): Promise<ActivityRow> {
    const [row] = await db.insert(activities).values(data).returning()
    return row
  },

  async log(
    entityType: string,
    entityId: string | null,
    action: string,
    source: string,
    detail?: unknown,
  ): Promise<void> {
    await db.insert(activities).values({
      entityType,
      entityId,
      action,
      detail: detail ? JSON.stringify(detail) : null,
      source,
    })
  },
}
