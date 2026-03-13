/** Agent 来源类型 */
export type AgentSource = "gateway" | "local" | "config"

/** Agent 运行状态 */
export type AgentStatus = "idle" | "running" | "error" | "offline"

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

/** 任务状态 */
export type TaskStatus = "pending" | "assigned" | "running" | "completed" | "failed" | "cancelled"

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

/** 会话状态 */
export type SessionStatus = "open" | "closed"

/** Session 数据结构 */
export interface Session {
  id: string
  agentId: string
  status: SessionStatus
  createdAt: string
  closedAt: string | null
}

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

/** 后端健康状态 */
export interface HealthStatus {
  status: string
  timestamp: string
}

/** 网关连接状态 */
export interface GatewayStatus {
  status: string
  connectedAt?: string
}

/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  ok: boolean
  code: number
  message: string
  data: T | null
}
