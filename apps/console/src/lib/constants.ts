/** TanStack Query 缓存 key */
export const QUERY_KEYS = {
  agents: ["agents"] as const,
  agent: (id: string) => ["agents", id] as const,
  agentLogs: (id: string) => ["agents", id, "logs"] as const,
  skills: ["skills"] as const,
  skill: (id: string) => ["skills", id] as const,
  tasks: ["tasks"] as const,
  task: (id: string) => ["tasks", id] as const,
  sessions: ["sessions"] as const,
  session: (id: string) => ["sessions", id] as const,
} as const

/** Agent 状态的显示文案和颜色 */
export const AGENT_STATUS_MAP = {
  idle: { label: "Idle", color: "text-gray-500" },
  running: { label: "Running", color: "text-green-600" },
  error: { label: "Error", color: "text-red-600" },
  offline: { label: "Offline", color: "text-yellow-600" },
} as const

/** Agent 来源的显示文案 */
export const AGENT_SOURCE_MAP = {
  gateway: { label: "Gateway" },
  local: { label: "Local" },
  config: { label: "Config" },
} as const

/** Task 状态的显示文案和颜色 */
export const TASK_STATUS_MAP = {
  pending: { label: "Pending", color: "text-gray-500" },
  assigned: { label: "Assigned", color: "text-blue-600" },
  running: { label: "Running", color: "text-green-600" },
  completed: { label: "Completed", color: "text-emerald-600" },
  failed: { label: "Failed", color: "text-red-600" },
  cancelled: { label: "Cancelled", color: "text-gray-400" },
} as const
