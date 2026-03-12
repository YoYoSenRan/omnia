import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const connections = sqliteTable('connections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  gatewayUrl: text('gateway_url').notNull(),
  token: text('token'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})
