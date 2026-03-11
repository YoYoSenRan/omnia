export interface Session {
  id: string
  agentId: string
  channel?: string
  messageCount: number
  createdAt: string
  lastMessageAt?: string
}
