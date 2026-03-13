import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core"

export type TaskStatus =
  | "inbox"
  | "assigned"
  | "in_progress"
  | "review"
  | "done"
  | "failed"
  | "cancelled"

export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").default("inbox").notNull(),
    priority: integer("priority").default(3),
    assignedTo: text("assigned_to"),
    result: text("result"),
    parentId: text("parent_id"),
    tags: text("tags").array(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("tasks_status_idx").on(table.status),
    index("tasks_assigned_to_idx").on(table.assignedTo),
  ],
)

export type TaskRow = typeof tasks.$inferSelect
export type TaskInsert = typeof tasks.$inferInsert
