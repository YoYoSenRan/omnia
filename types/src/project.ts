export interface ProjectTemplate {
  id: string
  name: string
  description?: string
  config: ProjectConfig
  createdAt: string
  updatedAt: string
}

export interface ProjectConfig {
  agents: ProjectAgentDef[]
  workflow: WorkflowStep[]
}

export interface ProjectAgentDef {
  role: string
  soul: string
  skills: string[]
  model?: string
}

export interface WorkflowStep {
  step: string
  agent: string
  prompt: string
}

export interface ProjectInstance {
  id: string
  templateId: string
  name: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  variables?: Record<string, string>
  createdAt: string
  updatedAt: string
}
