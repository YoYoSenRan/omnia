export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  toolCalls?: ToolCall[]
  timestamp: string
}

export interface ToolCall {
  id: string
  name: string
  params: unknown
  result?: unknown
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export interface SendMessageParams {
  agentId: string
  sessionId?: string
  message: string
}
