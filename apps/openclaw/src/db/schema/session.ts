import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core"

export type SessionStatus = "open" | "closed"

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  status: text("status").default("open").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
})

export type SessionRow = typeof sessions.$inferSelect
export type SessionInsert = typeof sessions.$inferInsert
