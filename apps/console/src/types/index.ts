/**
 * 全局类型定义
 *
 * 与 openclaw 后端 API 返回数据对应的前端类型。
 * 集中管理避免各文件重复定义。
 *
 * @module types
 */

// ── Agent ─────────────────────────────────────────────────

/** Agent 来源类型 */
export type AgentSource = 'gateway' | 'local' | 'config'

/** Agent 运行状态 */
export type AgentStatus = 'idle' | 'running' | 'error' | 'offline'

/** Agent 数据结构 */
export interface Agent {
  id: string
  name: string
  emoji: string | null
  model: string | null
  workspace: string | null
  status: AgentStatus
  source: AgentSource
  sourceRef: string | null
  soul: string | null
  config: string | null
  lastSyncAt: string | null
  lastActiveAt: string | null
  createdAt: string
  updatedAt: string
}

// ── Skill ─────────────────────────────────────────────────

/** Skill 数据结构 */
export interface Skill {
  id: string
  name: string
  description: string | null
  source: string
  contentHash: string | null
  createdAt: string
  updatedAt: string
}

// ── Task ──────────────────────────────────────────────────

/** 任务状态 */
export type TaskStatus = 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled'

/** Task 数据结构 */
export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  assignedTo: string | null
  result: string | null
  parentId: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

// ── Session ───────────────────────────────────────────────

/** 会话状态 */
export type SessionStatus = 'open' | 'closed'

/** Session 数据结构 */
export interface Session {
  id: string
  agentId: string
  status: SessionStatus
  createdAt: string
  closedAt: string | null
}

// ── Audit Log ─────────────────────────────────────────────

/** 审计日志 */
export interface AuditLog {
  id: number
  entityType: string
  entityId: string
  action: string
  detail: string | null
  source: string
  createdAt: string
}

// ── API 通用 ──────────────────────────────────────────────

/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  ok: boolean
  code: number
  message: string
  data: T | null
}
