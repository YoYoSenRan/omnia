/**
 * Skill 数据访问层
 *
 * @module db/repo/skill
 */

import { eq } from "drizzle-orm"
import { db } from "../index.js"
import { skills, type SkillInsert, type SkillRow } from "../schema/index.js"

export const skillRepo = {
  async findAll(): Promise<SkillRow[]> {
    return db.select().from(skills)
  },

  async findById(id: string): Promise<SkillRow | undefined> {
    const [row] = await db.select().from(skills).where(eq(skills.id, id))
    return row
  },

  async create(data: SkillInsert): Promise<SkillRow> {
    const [row] = await db.insert(skills).values(data).returning()
    return row
  },

  async update(id: string, data: Partial<SkillInsert>): Promise<SkillRow | undefined> {
    const [row] = await db
      .update(skills)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(skills.id, id))
      .returning()
    return row
  },

  async remove(id: string): Promise<boolean> {
    const result = await db.delete(skills).where(eq(skills.id, id)).returning()
    return result.length > 0
  },
}
