import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core"

export const activities = pgTable(
  "activities",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    action: text("action").notNull(),
    detail: text("detail"),
    source: text("source").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("activities_entity_idx").on(table.entityType, table.entityId),
    index("activities_created_at_idx").on(table.createdAt),
  ],
)

export type ActivityRow = typeof activities.$inferSelect
export type ActivityInsert = typeof activities.$inferInsert
