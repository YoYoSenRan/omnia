import WebSocket from 'ws'
import { EventEmitter } from 'node:events'
import pino from 'pino'
import type {
  ConnectionStatus,
  GatewayFrame,
  GatewayResponse,
  HelloOkPayload,
  OmniaEvent,
} from '@omnia/types'
import {
  createRequest,
  buildConnectParams,
  parseFrame,
  isResponse,
  isEvent,
  isConnectChallenge,
} from './protocol'
import { normalizeEvent, isInternalEvent } from './events'

const logger = pino({ name: 'adapter' })

interface AdapterOptions {
  gatewayUrl: string
  token?: string
}

interface PendingRequest {
  resolve: (payload: unknown) => void
  reject: (err: Error) => void
  timer: ReturnType<typeof setTimeout>
}

export class OpenClawAdapter extends EventEmitter {
  private ws: WebSocket | null = null
  private options: AdapterOptions
  private status: ConnectionStatus = 'disconnected'
  private pending = new Map<string, PendingRequest>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelay = 1000
  private tickTimer: ReturnType<typeof setInterval> | null = null
  private tickIntervalMs = 15000
  private connectRequestId: string | null = null

  constructor(options: AdapterOptions) {
    super()
    this.options = options
  }

  getStatus(): ConnectionStatus {
    return this.status
  }

  isConnected(): boolean {
    return this.status === 'connected'
  }

  async connect(): Promise<void> {
    if (this.ws) return

    this.setStatus('connecting')
    logger.info({ url: this.options.gatewayUrl }, 'Connecting to Gateway')

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.options.gatewayUrl)
      let settled = false

      const settle = (fn: typeof resolve | typeof reject, val?: unknown) => {
        if (settled) return
        settled = true
        ;(fn as (v?: unknown) => void)(val)
      }

      ws.on('open', () => {
        this.ws = ws
        this.reconnectDelay = 1000
        // Wait for connect.challenge event from Gateway
        // Some gateways may not send a challenge (e.g. --dev mode),
        // so we also handle the case where we need to send connect immediately
        logger.info('WebSocket open, waiting for challenge...')
      })

      ws.on('message', (data) => {
        const raw = data.toString()
        let frame: GatewayFrame
        try {
          frame = parseFrame(raw)
        } catch {
          logger.warn({ raw: raw.slice(0, 200) }, 'Failed to parse frame')
          return
        }

        // Phase 1: Handle connect.challenge → send connect request
        if (isConnectChallenge(frame)) {
          logger.info('Received connect.challenge, sending connect...')
          this.setStatus('authenticating')
          const params = buildConnectParams(this.options.token)
          const req = createRequest('connect', params)
          this.connectRequestId = req.id
          ws.send(JSON.stringify(req))
          return
        }

        // Phase 2: Handle connect response (hello-ok)
        if (isResponse(frame) && frame.id === this.connectRequestId) {
          this.connectRequestId = null
          if (frame.ok) {
            const payload = frame.payload as HelloOkPayload | undefined
            if (payload?.policy?.tickIntervalMs) {
              this.tickIntervalMs = payload.policy.tickIntervalMs
            }
            this.setStatus('connected')
            this.startTick()
            logger.info(
              { protocol: payload?.protocol, tickMs: this.tickIntervalMs },
              'Connected to Gateway'
            )
            settle(resolve)
          } else {
            const errMsg = frame.error?.message ?? 'Authentication failed'
            logger.error({ error: frame.error }, 'Connect rejected')
            settle(reject, new Error(errMsg))
            ws.close()
          }
          return
        }

        // Phase 3: Normal operation — route responses and events
        if (isResponse(frame)) {
          this.handleResponse(frame)
        } else if (isEvent(frame)) {
          if (!isInternalEvent(frame.event)) {
            const event = normalizeEvent(frame)
            this.emit('event', event)
          }
        }
      })

      ws.on('close', (code, reason) => {
        const wasConnected = this.status === 'connected'
        this.cleanup()
        this.setStatus('disconnected')
        logger.warn({ code, reason: reason.toString() }, 'Gateway connection closed')
        this.scheduleReconnect()
        if (!wasConnected) {
          settle(reject, new Error(`Connection closed (code ${code})`))
        }
      })

      ws.on('error', (err) => {
        logger.error({ err: err.message }, 'WebSocket error')
        settle(reject, err)
      })

      // Fallback: if no challenge arrives within 5s, send connect anyway
      // This handles gateways in --dev or --allow-unconfigured mode
      setTimeout(() => {
        if (this.status === 'connecting' && this.ws === ws) {
          logger.info('No challenge received, sending connect without challenge...')
          this.setStatus('authenticating')
          const params = buildConnectParams(this.options.token)
          const req = createRequest('connect', params)
          this.connectRequestId = req.id
          ws.send(JSON.stringify(req))
        }
      }, 5000)
    })
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.cleanup()
    this.setStatus('disconnected')
  }

  async request(method: string, params?: unknown): Promise<unknown> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Gateway')
    }

    const req = createRequest(method, params)

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(req.id)
        reject(new Error(`Request timeout: ${method}`))
      }, 30000)

      this.pending.set(req.id, { resolve, reject, timer })
      this.ws!.send(JSON.stringify(req))
    })
  }

  // Convenience methods — aligned with real Gateway RPC

  async getHealth() {
    return this.request('health')
  }

  async getStatus_() {
    return this.request('status')
  }

  async getPresence() {
    return this.request('system-presence')
  }

  async getToolsCatalog() {
    return this.request('tools.catalog')
  }

  async listModels() {
    return this.request('models.list')
  }

  // Agent operations
  async sendAgentMessage(params: {
    agent?: string
    sessionId?: string
    to?: string
    message: string
  }) {
    return this.request('agent', params)
  }

  // Session / chat
  async sendChat(params: { to: string; message: string; channel?: string }) {
    return this.request('chat.send', params)
  }

  async getChatHistory(sessionId: string) {
    return this.request('chat.history', { sessionId })
  }

  // Exec approvals
  async resolveApproval(params: { runId: string; approved: boolean; reason?: string }) {
    return this.request('exec.approval.resolve', params)
  }

  // Internal

  private handleResponse(frame: GatewayResponse): void {
    const pending = this.pending.get(frame.id)
    if (!pending) return

    this.pending.delete(frame.id)
    clearTimeout(pending.timer)

    if (frame.ok) {
      pending.resolve(frame.payload)
    } else {
      pending.reject(new Error(frame.error?.message ?? 'Unknown error'))
    }
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status
    this.emit('connectionChange', status)
  }

  private startTick(): void {
    this.tickTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping()
      }
    }, this.tickIntervalMs)
  }

  private cleanup(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer)
      this.tickTimer = null
    }
    this.connectRequestId = null
    for (const [, pending] of this.pending) {
      clearTimeout(pending.timer)
      pending.reject(new Error('Connection closed'))
    }
    this.pending.clear()
    if (this.ws) {
      this.ws.removeAllListeners()
      this.ws.close()
      this.ws = null
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    logger.info({ delay: this.reconnectDelay }, 'Scheduling reconnect')
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null
      try {
        await this.connect()
      } catch {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000)
        this.scheduleReconnect()
      }
    }, this.reconnectDelay)
  }
}
