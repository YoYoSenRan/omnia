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

export type GatewayClientId =
  | 'webchat-ui' | 'openclaw-control-ui' | 'webchat' | 'cli'
  | 'gateway-client' | 'openclaw-macos' | 'openclaw-ios'
  | 'openclaw-android' | 'node-host' | 'test' | 'fingerprint'
  | 'openclaw-probe'

export type GatewayClientMode =
  | 'webchat' | 'cli' | 'ui' | 'backend' | 'node' | 'probe' | 'test'

export interface ConnectParams {
  minProtocol: number
  maxProtocol: number
  client: {
    id: GatewayClientId
    displayName?: string
    version: string
    platform: string
    deviceFamily?: string
    modelIdentifier?: string
    mode: GatewayClientMode
    instanceId?: string
  }
  caps?: string[]
  commands?: string[]
  permissions?: Record<string, boolean>
  pathEnv?: string
  role?: string
  scopes?: string[]
  device?: {
    id: string
    publicKey: string
    signature: string
    signedAt: number
    nonce: string
  }
  auth?: {
    token?: string
    deviceToken?: string
    password?: string
  }
  locale?: string
  userAgent?: string
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
