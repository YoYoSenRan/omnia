export interface ConnectionProfile {
  id: string
  name: string
  gatewayUrl: string
  token?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ConnectionStatusInfo {
  id: string
  name: string
  gatewayUrl: string
  status: 'disconnected' | 'connecting' | 'authenticating' | 'connected'
  isActive: boolean
}
