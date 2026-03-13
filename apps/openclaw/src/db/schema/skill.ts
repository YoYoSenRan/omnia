import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  source: text("source").notNull(),
  sourceRef: text("source_ref"),
  contentHash: text("content_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export type SkillRow = typeof skills.$inferSelect
export type SkillInsert = typeof skills.$inferInsert
