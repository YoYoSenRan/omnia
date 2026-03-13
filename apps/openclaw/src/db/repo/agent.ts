/**
 * Agent 数据访问层
 *
 * @module db/repo/agent
 */

import { eq } from 'drizzle-orm'
import { db } from '../index.js'
import { agents, type AgentInsert, type AgentRow } from '../schema.js'

export const agentRepo = {
  async findAll(): Promise<AgentRow[]> {
    return db.select().from(agents)
  },

  async findById(id: string): Promise<AgentRow | undefined> {
    const [row] = await db.select().from(agents).where(eq(agents.id, id))
    return row
  },

  async create(data: AgentInsert): Promise<AgentRow> {
    const [row] = await db.insert(agents).values(data).returning()
    return row
  },

  async update(id: string, data: Partial<AgentInsert>): Promise<AgentRow | undefined> {
    const [row] = await db
      .update(agents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning()
    return row
  },

  async remove(id: string): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id)).returning()
    return result.length > 0
  },

  async upsert(data: AgentInsert): Promise<AgentRow> {
    const [row] = await db
      .insert(agents)
      .values(data)
      .onConflictDoUpdate({
        target: agents.id,
        set: {
          name: data.name,
          emoji: data.emoji,
          role: data.role,
          model: data.model,
          workspace: data.workspace,
          status: data.status,
          source: data.source,
          sourceRef: data.sourceRef,
          soul: data.soul,
          config: data.config,
          contentHash: data.contentHash,
          lastSyncAt: data.lastSyncAt,
          updatedAt: new Date(),
        },
      })
      .returning()
    return row
  },
}
