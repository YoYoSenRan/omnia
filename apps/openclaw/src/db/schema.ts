/**
 * 数据库 Schema 定义
 *
 * openclaw 服务使用 omnia_core 数据库，存储所有 OpenClaw 相关数据：
 * - agents: Agent 信息（支持多源：网关 / 磁盘 / 配置文件）
 * - skills: Skill 定义
 * - tasks: 任务信息（支持树形结构）
 * - sessions: 会话记录
 * - audit_logs: 操作审计日志
 *
 * @module db/schema
 */

import {
  pgTable,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core'

// ── Agents 表 ─────────────────────────────────────────────

/** Agent 来源类型：网关同步 | 本地磁盘 | 配置文件 */
export type AgentSource = 'gateway' | 'local' | 'config'

/** Agent 运行状态 */
export type AgentStatus = 'idle' | 'running' | 'error' | 'offline'

/**
 * agents 表 — 存储 Agent 信息
 *
 * 支持三种来源（gateway / local / config），
 * 通过 source + source_ref 关联到具体的发现位置。
 */
export const agents = pgTable('agents', {
  /** Agent 唯一标识 */
  id: text('id').primaryKey(),
  /** Agent 名称 */
  name: text('name').notNull(),
  /** Agent 显示图标（emoji） */
  emoji: text('emoji'),
  /** 使用的 AI 模型 */
  model: text('model'),
  /** 工作目录路径 */
  workspace: text('workspace'),
  /** 运行状态：idle | running | error | offline */
  status: text('status').default('idle').notNull(),
  /** 来源类型：gateway | local | config */
  source: text('source').notNull(),
  /** 来源引用（connectionId / 磁盘路径 / 配置路径） */
  sourceRef: text('source_ref'),
  /** soul.md 内容缓存 */
  soul: text('soul'),
  /** 额外配置（JSON 字符串） */
  config: text('config'),
  /** 最后同步时间 */
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  /** 最后活跃时间 */
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  /** 创建时间 */
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  /** 更新时间 */
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

/** Agent 表行类型 */
export type AgentRow = typeof agents.$inferSelect
/** Agent 插入类型 */
export type AgentInsert = typeof agents.$inferInsert

// ── Skills 表 ─────────────────────────────────────────────

/**
 * skills 表 — 存储 Skill 定义
 *
 * Skill 是 Agent 可调用的能力单元，
 * 通过同步从网关获取或手动注册。
 */
export const skills = pgTable('skills', {
  /** Skill 唯一标识 */
  id: text('id').primaryKey(),
  /** Skill 名称 */
  name: text('name').notNull(),
  /** Skill 描述 */
  description: text('description'),
  /** 来源类型 */
  source: text('source').notNull(),
  /** 内容哈希（用于检测变更） */
  contentHash: text('content_hash'),
  /** 创建时间 */
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  /** 更新时间 */
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

/** Skill 表行类型 */
export type SkillRow = typeof skills.$inferSelect
/** Skill 插入类型 */
export type SkillInsert = typeof skills.$inferInsert

// ── Tasks 表 ──────────────────────────────────────────────

/** 任务状态 */
export type TaskStatus = 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * tasks 表 — 存储任务信息
 *
 * 支持树形结构（parent_id），一个任务可拆解为多个子任务。
 * 任务可分配给特定 Agent 执行。
 */
export const tasks = pgTable('tasks', {
  /** 任务唯一标识 */
  id: text('id').primaryKey(),
  /** 任务标题 */
  title: text('title').notNull(),
  /** 任务描述 */
  description: text('description'),
  /** 任务状态 */
  status: text('status').default('pending').notNull(),
  /** 分配的 Agent ID */
  assignedTo: text('assigned_to'),
  /** 执行结果（JSON 字符串） */
  result: text('result'),
  /** 父任务 ID（树形结构） */
  parentId: text('parent_id'),
  /** 创建时间 */
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  /** 更新时间 */
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  /** 完成时间 */
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

/** Task 表行类型 */
export type TaskRow = typeof tasks.$inferSelect
/** Task 插入类型 */
export type TaskInsert = typeof tasks.$inferInsert

// ── Sessions 表 ───────────────────────────────────────────

/** 会话状态 */
export type SessionStatus = 'open' | 'closed'

/**
 * sessions 表 — 存储会话记录
 *
 * 每个会话关联一个 Agent，记录交互过程。
 */
export const sessions = pgTable('sessions', {
  /** 会话唯一标识 */
  id: text('id').primaryKey(),
  /** 关联的 Agent ID */
  agentId: text('agent_id').notNull(),
  /** 会话状态：open | closed */
  status: text('status').default('open').notNull(),
  /** 创建时间 */
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  /** 关闭时间 */
  closedAt: timestamp('closed_at', { withTimezone: true }),
})

/** Session 表行类型 */
export type SessionRow = typeof sessions.$inferSelect
/** Session 插入类型 */
export type SessionInsert = typeof sessions.$inferInsert

// ── Audit Logs 表 ─────────────────────────────────────────

/**
 * audit_logs 表 — 操作审计日志
 *
 * 记录所有实体的创建、更新、删除、同步等操作，
 * 用于追溯变更历史。
 */
export const auditLogs = pgTable('audit_logs', {
  /** 日志唯一标识（自增） */
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  /** 实体类型：agent | skill | task | session */
  entityType: text('entity_type').notNull(),
  /** 实体 ID */
  entityId: text('entity_id').notNull(),
  /** 操作类型：created | updated | deleted | synced | status_change */
  action: text('action').notNull(),
  /** 操作详情（JSON 字符串） */
  detail: text('detail'),
  /** 操作来源：user | sync | gateway | system */
  source: text('source').notNull(),
  /** 创建时间 */
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

/** AuditLog 表行类型 */
export type AuditLogRow = typeof auditLogs.$inferSelect
/** AuditLog 插入类型 */
export type AuditLogInsert = typeof auditLogs.$inferInsert
