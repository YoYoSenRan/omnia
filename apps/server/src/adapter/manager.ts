import { EventEmitter } from 'node:events'
import pino from 'pino'
import type { ConnectionProfile, ConnectionStatusInfo } from '@omnia/types'
import { OpenClawAdapter } from './client'

const logger = pino({ name: 'adapter-manager' })

export class AdapterManager extends EventEmitter {
  private adapters = new Map<string, OpenClawAdapter>()
  private profiles = new Map<string, ConnectionProfile>()
  private activeId: string | null = null

  getActive(): OpenClawAdapter | null {
    if (!this.activeId) return null
    return this.adapters.get(this.activeId) ?? null
  }

  getActiveId(): string | null {
    return this.activeId
  }

  async connect(profile: ConnectionProfile): Promise<void> {
    if (this.adapters.has(profile.id)) {
      logger.warn({ id: profile.id }, 'Already connected, disconnect first')
      return
    }

    const adapter = new OpenClawAdapter({
      gatewayUrl: profile.gatewayUrl,
      token: profile.token,
    })

    // Forward events with connection id
    adapter.on('event', (event) => {
      this.emit('event', { ...event, connectionId: profile.id })
    })
    adapter.on('connectionChange', (status) => {
      this.emit('connectionChange', { connectionId: profile.id, status })
    })

    this.adapters.set(profile.id, adapter)
    this.profiles.set(profile.id, profile)

    logger.info({ id: profile.id, name: profile.name, url: profile.gatewayUrl }, 'Connecting...')
    await adapter.connect()
  }

  disconnect(id: string): void {
    const adapter = this.adapters.get(id)
    if (!adapter) return

    adapter.disconnect()
    adapter.removeAllListeners()
    this.adapters.delete(id)
    this.profiles.delete(id)

    if (this.activeId === id) {
      this.activeId = null
    }

    logger.info({ id }, 'Disconnected')
  }

  setActive(id: string): void {
    if (!this.adapters.has(id)) {
      throw new Error(`Connection ${id} is not connected`)
    }
    this.activeId = id
    logger.info({ id }, 'Set as active connection')
  }

  getAdapter(id: string): OpenClawAdapter | undefined {
    return this.adapters.get(id)
  }

  isConnected(id: string): boolean {
    return this.adapters.get(id)?.isConnected() ?? false
  }

  getAllStatus(): ConnectionStatusInfo[] {
    const result: ConnectionStatusInfo[] = []
    for (const [id, profile] of this.profiles) {
      const adapter = this.adapters.get(id)
      result.push({
        id,
        name: profile.name,
        gatewayUrl: profile.gatewayUrl,
        status: adapter?.getStatus() ?? 'disconnected',
        isActive: id === this.activeId,
      })
    }
    return result
  }

  disconnectAll(): void {
    for (const id of [...this.adapters.keys()]) {
      this.disconnect(id)
    }
  }
}
