import WebSocket from 'ws'
import { EventEmitter } from 'node:events'
import pino from 'pino'
import type { ConnectionStatus, GatewayFrame, GatewayResponse, OmniaEvent } from '@omnia/types'
import { createRequest, parseFrame, isResponse, isEvent } from './protocol'
import { normalizeEvent } from './events'

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
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null

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

      ws.on('open', () => {
        this.ws = ws
        this.setStatus('authenticating')
        this.reconnectDelay = 1000
        // Send connect handshake
        ws.send(JSON.stringify(createRequest('connect', {
          role: 'operator',
          scopes: ['operator.read', 'operator.write', 'operator.admin', 'operator.approvals'],
          device: { id: 'omnia-server', name: 'Omnia' },
          ...(this.options.token ? { token: this.options.token } : {}),
        })))
      })

      ws.on('message', (data) => {
        const raw = data.toString()
        let frame: GatewayFrame
        try {
          frame = parseFrame(raw)
        } catch {
          logger.warn({ raw }, 'Failed to parse frame')
          return
        }

        if (isResponse(frame)) {
          this.handleResponse(frame)

          // First successful response after connect = authenticated
          if (this.status === 'authenticating' && frame.ok) {
            this.setStatus('connected')
            this.startHeartbeat()
            logger.info('Connected to Gateway')
            resolve()
          }
        } else if (isEvent(frame)) {
          const event = normalizeEvent(frame)
          this.emit('event', event)
        }
      })

      ws.on('close', () => {
        this.cleanup()
        this.setStatus('disconnected')
        logger.warn('Gateway connection closed')
        this.scheduleReconnect()
        // Only reject if we never connected
        if (this.status !== 'connected') {
          reject(new Error('Connection closed before authentication'))
        }
      })

      ws.on('error', (err) => {
        logger.error({ err }, 'WebSocket error')
        if (this.status !== 'connected') {
          reject(err)
        }
      })
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

  // Convenience methods

  async listAgents() {
    return this.request('agents.list')
  }

  async createAgent(config: unknown) {
    return this.request('agents.create', config)
  }

  async updateAgent(id: string, config: unknown) {
    return this.request('agents.update', { id, ...config as object })
  }

  async deleteAgent(id: string) {
    return this.request('agents.delete', { id })
  }

  async sendMessage(agentId: string, message: string, sessionId?: string) {
    return this.request('chat.send', { agentId, message, sessionId })
  }

  async abortChat(agentId: string) {
    return this.request('chat.abort', { agentId })
  }

  async getChatHistory(sessionId: string) {
    return this.request('chat.history', { sessionId })
  }

  async listSessions() {
    return this.request('sessions.list')
  }

  async resetSession(sessionId: string) {
    return this.request('sessions.reset', { sessionId })
  }

  async compactSession(sessionId: string) {
    return this.request('sessions.compact', { sessionId })
  }

  async getToolsCatalog() {
    return this.request('tools.catalog')
  }

  async listModels() {
    return this.request('models.list')
  }

  async listCronJobs() {
    return this.request('cron.list')
  }

  async addCronJob(config: unknown) {
    return this.request('cron.add', config)
  }

  async runCronJob(id: string) {
    return this.request('cron.run', { id })
  }

  async installSkill(url: string) {
    return this.request('skills.install', { url })
  }

  async updateSkill(name: string) {
    return this.request('skills.update', { name })
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

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping()
      }
    }, 30000)
  }

  private cleanup(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    for (const [id, pending] of this.pending) {
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
