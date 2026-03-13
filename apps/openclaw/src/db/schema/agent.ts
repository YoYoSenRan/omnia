import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core"

export type AgentSource = "gateway" | "local" | "config"
export type AgentStatus = "idle" | "busy" | "error" | "offline"

export const agents = pgTable(
  "agents",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    emoji: text("emoji"),
    role: text("role").default("agent"),
    model: text("model"),
    workspace: text("workspace"),
    status: text("status").default("offline").notNull(),
    source: text("source").notNull(),
    sourceRef: text("source_ref"),
    soul: text("soul"),
    config: jsonb("config"),
    contentHash: text("content_hash"),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("agents_status_idx").on(table.status),
    index("agents_source_idx").on(table.source),
  ],
)

export type AgentRow = typeof agents.$inferSelect
export type AgentInsert = typeof agents.$inferInsert
