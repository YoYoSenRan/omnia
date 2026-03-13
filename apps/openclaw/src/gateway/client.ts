/**
 * 网关 WebSocket 客户端
 *
 * 管理与 OpenClaw 网关的 WebSocket 连接，支持自动重连和心跳。
 *
 * @module gateway/client
 */

import WebSocket from "ws"
import { gwLogger } from "../utils/logger.js"
import { generateId } from "../utils/id.js"
import { type GatewayFrame, type HandshakePayload, encodeFrame, decodeFrame } from "./protocol.js"

export type GatewayStatus = "disconnected" | "connecting" | "connected" | "error"

export interface GatewayClientOptions {
  url: string
  token?: string
  /** 最大重连次数 */
  maxRetries?: number
  /** 心跳间隔（ms） */
  heartbeatInterval?: number
  /** RPC 超时（ms） */
  requestTimeout?: number
}

type MessageHandler = (frame: GatewayFrame) => void

/** 全局网关客户端单例 */
let _instance: GatewayClient | null = null

export function getGatewayClient(): GatewayClient | null {
  return _instance
}

export function setGatewayClient(client: GatewayClient | null): void {
  _instance = client
}

export class GatewayClient {
  private ws: WebSocket | null = null
  private _status: GatewayStatus = "disconnected"
  private retryCount = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private missedPongs = 0
  private pendingRequests = new Map<
    string,
    {
      resolve: (result: unknown) => void
      reject: (err: Error) => void
      timer: ReturnType<typeof setTimeout>
    }
  >()
  private messageHandler: MessageHandler | null = null

  private readonly url: string
  private readonly token: string
  private readonly maxRetries: number
  private readonly heartbeatInterval: number
  private readonly requestTimeout: number

  constructor(options: GatewayClientOptions) {
    this.url = options.url
    this.token = options.token ?? ""
    this.maxRetries = options.maxRetries ?? 10
    this.heartbeatInterval = options.heartbeatInterval ?? 30_000
    this.requestTimeout = options.requestTimeout ?? 10_000
  }

  get status(): GatewayStatus {
    return this._status
  }

  get connected(): boolean {
    return this._status === "connected"
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler
  }

  /**
   * 建立连接
   */
  connect(): void {
    if (this._status === "connecting" || this._status === "connected") return
    if (!this.url) {
      gwLogger.info("No gateway URL configured, skipping connection")
      return
    }

    this._status = "connecting"
    gwLogger.info({ url: this.url }, "Connecting to gateway")

    try {
      this.ws = new WebSocket(this.url)
    } catch (err) {
      gwLogger.error({ err }, "Failed to create WebSocket")
      this._status = "error"
      this.scheduleReconnect()
      return
    }

    this.ws.on("open", () => {
      gwLogger.info("WebSocket connected, sending handshake")
      this._status = "connected"
      this.retryCount = 0
      this.missedPongs = 0

      // 发送握手
      const handshake: HandshakePayload = {
        protocol: "v3",
        client: "omnia-openclaw",
        mode: "server",
        token: this.token || undefined,
      }
      this.send({ type: "event", event: "handshake", payload: handshake })

      // 启动心跳
      this.startHeartbeat()
    })

    this.ws.on("message", (data) => {
      const raw = data.toString()
      const frame = decodeFrame(raw)
      if (!frame) {
        gwLogger.warn({ raw: raw.slice(0, 200) }, "Invalid frame received")
        return
      }

      // 处理 RPC 响应
      if (frame.type === "res" && frame.id) {
        const pending = this.pendingRequests.get(frame.id)
        if (pending) {
          clearTimeout(pending.timer)
          this.pendingRequests.delete(frame.id)
          if (frame.ok) {
            pending.resolve(frame.result)
          } else {
            pending.reject(new Error(frame.error?.message ?? "RPC failed"))
          }
        }
        return
      }

      // 处理 pong
      if (frame.type === "event" && frame.event === "pong") {
        this.missedPongs = 0
        return
      }

      // 分发给消息处理器
      if (this.messageHandler) {
        this.messageHandler(frame)
      }
    })

    this.ws.on("close", (code, reason) => {
      gwLogger.info({ code, reason: reason.toString() }, "WebSocket closed")
      this.cleanup()
      this._status = "disconnected"
      this.scheduleReconnect()
    })

    this.ws.on("error", (err) => {
      gwLogger.error({ err }, "WebSocket error")
      this._status = "error"
    })
  }

  /**
   * 优雅断开
   */
  disconnect(): void {
    this.retryCount = this.maxRetries // 阻止重连
    this.cleanup()
    if (this.ws) {
      this.ws.close(1000, "Client disconnect")
      this.ws = null
    }
    this._status = "disconnected"
    gwLogger.info("Gateway client disconnected")
  }

  /**
   * 发送消息帧
   */
  send(frame: GatewayFrame): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false
    this.ws.send(encodeFrame(frame))
    return true
  }

  /**
   * RPC 请求（返回 Promise）
   */
  request(method: string, params?: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = generateId()

      const timer = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error(`RPC timeout: ${method}`))
      }, this.requestTimeout)

      this.pendingRequests.set(id, { resolve, reject, timer })

      const sent = this.send({
        type: "req",
        method,
        id,
        payload: params,
      })

      if (!sent) {
        clearTimeout(timer)
        this.pendingRequests.delete(id)
        reject(new Error("Gateway not connected"))
      }
    })
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.missedPongs >= 3) {
        gwLogger.warn("3 missed pongs, reconnecting")
        this.ws?.close(4001, "Heartbeat timeout")
        return
      }
      this.missedPongs++
      this.send({ type: "event", event: "ping" })
    }, this.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect(): void {
    if (this.retryCount >= this.maxRetries) {
      gwLogger.error({ retries: this.retryCount }, "Max reconnect attempts reached")
      this._status = "error"
      return
    }

    // 指数退避: base * 1.7^attempt, 上限 15s
    const delay = Math.min(1000 * Math.pow(1.7, this.retryCount), 15_000)
    this.retryCount++

    gwLogger.info({ attempt: this.retryCount, delay }, "Scheduling reconnect")
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      this.connect()
    }, delay)
  }

  private cleanup(): void {
    this.stopHeartbeat()
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
    // 拒绝所有 pending 请求
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timer)
      pending.reject(new Error("Connection closed"))
      this.pendingRequests.delete(id)
    }
  }
}
