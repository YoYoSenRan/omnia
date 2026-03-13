/**
 * 数据库 Schema 定义
 *
 * server 服务使用 omnia_app 数据库，存储业务层数据。
 * 当前为骨架阶段，后续按业务需求扩展表定义。
 *
 * @module db/schema
 */

import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// ── 示例：业务项目表 ─────────────────────────────────────

/**
 * projects 表 — 业务项目
 *
 * 每个项目代表一个用户创建的业务场景，
 * 通过 Core 服务关联 Agent 进行任务编排。
 */
export const projects = pgTable('projects', {
  /** 项目唯一标识 */
  id: text('id').primaryKey(),
  /** 项目名称 */
  name: text('name').notNull(),
  /** 项目描述 */
  description: text('description'),
  /** 创建时间 */
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  /** 更新时间 */
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

/** Project 表行类型 */
export type ProjectRow = typeof projects.$inferSelect
/** Project 插入类型 */
export type ProjectInsert = typeof projects.$inferInsert
