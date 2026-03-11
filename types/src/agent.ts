export interface Agent {
  id: string
  name: string
  emoji?: string
  model?: string
  workspace?: string
  status: AgentStatus
  lastActiveAt?: string
}

export type AgentStatus = 'idle' | 'running' | 'error'

export interface CreateAgentParams {
  name: string
  emoji?: string
  model?: string
}
