// Gateway Protocol v3 frame types

export interface GatewayRequest {
  type: 'req'
  id: string
  method: string
  params?: unknown
}

export interface GatewayResponse {
  type: 'res'
  id: string
  ok: boolean
  payload?: unknown
  error?: GatewayError
}

export interface GatewayEvent {
  type: 'event'
  event: string
  payload?: unknown
  seq?: number
  stateVersion?: unknown
}

export interface GatewayError {
  code: string
  message: string
}

export type GatewayFrame = GatewayRequest | GatewayResponse | GatewayEvent

// Omnia internal event (normalized from Gateway events)
export interface OmniaEvent {
  type: string
  payload: unknown
  timestamp: string
}

// Connection status
export type ConnectionStatus = 'disconnected' | 'connecting' | 'authenticating' | 'connected'

export interface SystemStatus {
  gateway: ConnectionStatus
  uptime: number
}
