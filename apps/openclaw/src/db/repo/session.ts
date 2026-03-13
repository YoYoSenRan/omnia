/**
 * Session 数据访问层
 *
 * @module db/repo/session
 */

import { eq } from "drizzle-orm"
import { db } from "../index.js"
import { sessions, type SessionInsert, type SessionRow } from "../schema/index.js"

export const sessionRepo = {
  async findAll(): Promise<SessionRow[]> {
    return db.select().from(sessions)
  },

  async findById(id: string): Promise<SessionRow | undefined> {
    const [row] = await db.select().from(sessions).where(eq(sessions.id, id))
    return row
  },

  async findByAgentId(agentId: string): Promise<SessionRow[]> {
    return db.select().from(sessions).where(eq(sessions.agentId, agentId))
  },

  async create(data: SessionInsert): Promise<SessionRow> {
    const [row] = await db.insert(sessions).values(data).returning()
    return row
  },

  async update(id: string, data: Partial<SessionInsert>): Promise<SessionRow | undefined> {
    const [row] = await db.update(sessions).set(data).where(eq(sessions.id, id)).returning()
    return row
  },

  async remove(id: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.id, id))
    return (result.rowCount ?? 0) > 0
  },
}
