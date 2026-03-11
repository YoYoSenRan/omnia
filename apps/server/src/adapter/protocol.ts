import type { GatewayRequest, GatewayResponse, GatewayEvent, GatewayFrame } from '@omnia/types'

let requestId = 0

export function createRequest(method: string, params?: unknown): GatewayRequest {
  return {
    type: 'req',
    id: String(++requestId),
    method,
    params,
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
