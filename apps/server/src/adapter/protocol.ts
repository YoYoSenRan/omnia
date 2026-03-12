import type {
  GatewayRequest,
  GatewayResponse,
  GatewayEvent,
  GatewayFrame,
  ConnectParams,
  ConnectChallenge,
} from '@omnia/types'

let requestId = 0

export function createRequest(method: string, params?: unknown): GatewayRequest {
  return {
    type: 'req',
    id: String(++requestId),
    method,
    params,
  }
}

export function buildConnectParams(token?: string): ConnectParams {
  return {
    minProtocol: 3,
    maxProtocol: 3,
    client: {
      id: 'gateway-client',
      version: '0.0.1',
      platform: process.platform,
      mode: 'backend',
    },
    caps: [],
    ...(token ? { auth: { token } } : {}),
    locale: 'en-US',
    userAgent: 'omnia-server/0.0.1',
  }
}

export function parseFrame(data: string): GatewayFrame {
  return JSON.parse(data) as GatewayFrame
}

export function isResponse(frame: GatewayFrame): frame is GatewayResponse {
  return frame.type === 'res'
}

export function isEvent(frame: GatewayFrame): frame is GatewayEvent {
  return frame.type === 'event'
}

export function isConnectChallenge(frame: GatewayFrame): frame is GatewayEvent & { payload: ConnectChallenge } {
  return frame.type === 'event' && (frame as GatewayEvent).event === 'connect.challenge'
}
