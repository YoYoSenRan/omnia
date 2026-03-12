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
  details?: {
    code?: string
    reason?: string
    canRetryWithDeviceToken?: boolean
    recommendedNextStep?: string
  }
}

export type GatewayFrame = GatewayRequest | GatewayResponse | GatewayEvent

// Connect handshake types

export interface ConnectChallenge {
  nonce: string
  ts: number
}

export interface ConnectParams {
  minProtocol: number
  maxProtocol: number
  client: {
    id: string
    version: string
    platform: string
    mode: 'operator' | 'node'
  }
  role: 'operator' | 'node'
  scopes: string[]
  caps: string[]
  commands: string[]
  permissions: Record<string, boolean>
  auth: { token: string }
  locale: string
  userAgent: string
  device: {
    id: string
  }
}

export interface HelloOkPayload {
  type: 'hello-ok'
  protocol: number
  policy: {
    tickIntervalMs: number
  }
  auth?: {
    deviceToken: string
    role: string
    scopes: string[]
  }
}

// Omnia internal event (normalized from Gateway events)
export interface OmniaEvent {
  type: string
  payload: unknown
  timestamp: string
  seq?: number
}

// Connection status
export type ConnectionStatus = 'disconnected' | 'connecting' | 'authenticating' | 'connected'

export interface SystemStatus {
  gateway: ConnectionStatus
  uptime: number
}
