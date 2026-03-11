export interface Execution {
  id: string
  agentId: string
  sessionId?: string
  instanceId?: string
  message?: string
  status: 'running' | 'completed' | 'failed' | 'aborted'
  tokenUsage?: { input: number; output: number }
  durationMs?: number
  startedAt: string
  finishedAt?: string
}

export interface ExecutionEvent {
  id: string
  executionId: string
  eventType: string
  payload: unknown
  createdAt: string
}
