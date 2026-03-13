/**
 * 数据库 Schema 定义
 *
 * @module db/schema
 */

import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'

// ── Agents 表 ─────────────────────────────────────────────

export type AgentSource = 'gateway' | 'local' | 'config'
export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline'

export const agents = pgTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  emoji: text('emoji'),
  role: text('role').default('agent'),
  model: text('model'),
  workspace: text('workspace'),
  status: text('status').default('offline').notNull(),
  source: text('source').notNull(),
  sourceRef: text('source_ref'),
  soul: text('soul'),
  config: jsonb('config'),
  contentHash: text('content_hash'),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('agents_status_idx').on(table.status),
  index('agents_source_idx').on(table.source),
])

export type AgentRow = typeof agents.$inferSelect
export type AgentInsert = typeof agents.$inferInsert

// ── Skills 表 ─────────────────────────────────────────────

export const skills = pgTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  source: text('source').notNull(),
  sourceRef: text('source_ref'),
  contentHash: text('content_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type SkillRow = typeof skills.$inferSelect
export type SkillInsert = typeof skills.$inferInsert

// ── Tasks 表 ──────────────────────────────────────────────

export type TaskStatus = 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done' | 'failed' | 'cancelled'

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('inbox').notNull(),
  priority: integer('priority').default(3),
  assignedTo: text('assigned_to'),
  result: text('result'),
  parentId: text('parent_id'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => [
  index('tasks_status_idx').on(table.status),
  index('tasks_assigned_to_idx').on(table.assignedTo),
])

export type TaskRow = typeof tasks.$inferSelect
export type TaskInsert = typeof tasks.$inferInsert

// ── Sessions 表 ───────────────────────────────────────────

export type SessionStatus = 'open' | 'closed'

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  status: text('status').default('open').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
})

export type SessionRow = typeof sessions.$inferSelect
export type SessionInsert = typeof sessions.$inferInsert

// ── Activities 表（原 audit_logs，重命名以对齐 MC） ──────

export const activities = pgTable('activities', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  action: text('action').notNull(),
  detail: text('detail'),
  source: text('source').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('activities_entity_idx').on(table.entityType, table.entityId),
  index('activities_created_at_idx').on(table.createdAt),
])

export type ActivityRow = typeof activities.$inferSelect
export type ActivityInsert = typeof activities.$inferInsert

