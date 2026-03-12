export interface Agent {
  id: string
  name: string
  emoji?: string
  model?: string
  workspace?: string
  status?: AgentStatus
  lastActiveAt?: string
}

export type AgentStatus = 'idle' | 'running' | 'error'

export interface AgentsListResponse {
  defaultId: string
  mainKey: string
  scope: string
  agents: Agent[]
}

export interface CreateAgentParams {
  name: string
  emoji?: string
  model?: string
}

export interface UpdateAgentParams {
  name?: string
  emoji?: string
  model?: string
}
