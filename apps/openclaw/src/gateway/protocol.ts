/**
 * 网关协议定义（兼容 MC v3）
 *
 * @module gateway/protocol
 */

/** 网关消息帧 */
export interface GatewayFrame {
  type: 'event' | 'req' | 'res'
  /** 事件名（type=event 时） */
  event?: string
  /** RPC 方法名（type=req 时） */
  method?: string
  /** 请求 ID（type=req/res 时） */
  id?: string
  /** 请求参数 */
  payload?: unknown
  /** 响应成功标志（type=res 时） */
  ok?: boolean
  /** 响应数据（type=res 时） */
  result?: unknown
  /** 错误信息（type=res 时） */
  error?: { message: string; code?: string }
  /** 事件序列号 */
  seq?: number
}

/** 网关事件类型 */
export type GatewayEventType =
  | 'tick'
  | 'agent.status'
  | 'task.created'
  | 'task.updated'
  | 'session.created'
  | 'session.message'
  | 'log'

/** 握手消息 */
export interface HandshakePayload {
  protocol: 'v3'
  client: 'omnia-openclaw'
  mode: 'server'
  token?: string
}

/** 序列化帧为 JSON 字符串 */
export function encodeFrame(frame: GatewayFrame): string {
  return JSON.stringify(frame)
}

/** 从 JSON 字符串解析帧 */
export function decodeFrame(data: string): GatewayFrame | null {
  try {
    return JSON.parse(data) as GatewayFrame
  } catch {
    return null
  }
}
