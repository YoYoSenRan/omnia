/**
 * Sync Service — 多源发现与合并
 *
 * @module services/sync
 */

import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { agentRepo } from '../db/repo/agent.js'
import { activityRepo } from '../db/repo/activity.js'
import { emitEvent } from '../events/bus.js'
import { syncLogger } from '../utils/logger.js'
import { AGENTS_DIR, OPENCLAW_CONFIG } from '../utils/env.js'
import type { AgentInsert, AgentRow } from '../db/schema.js'
import type { GatewayClient } from '../gateway/client.js'

interface DiscoveredAgent {
  id: string
  name: string
  source: 'gateway' | 'local' | 'config'
  sourceRef?: string
  emoji?: string | null
  role?: string | null
  model?: string | null
  workspace?: string | null
  soul?: string | null
  config?: unknown
  contentHash?: string
}

interface SyncResult {
  created: string[]
  updated: string[]
  offlined: string[]
}

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

function resolvePath(p: string): string {
  if (p.startsWith('~')) {
    return join(process.env.HOME ?? '/root', p.slice(1))
  }
  return p
}

export const syncService = {
  /**
   * 从网关发现 agent（通过 RPC 调用）
   */
  async discoverFromGateway(client: GatewayClient): Promise<DiscoveredAgent[]> {
    if (!client.connected) return []

    try {
      const result = await client.request('agents.list', {})
      if (!Array.isArray(result)) return []

      return result.map((a: Record<string, unknown>) => ({
        id: String(a.id ?? a.name),
        name: String(a.name),
        source: 'gateway' as const,
        sourceRef: String(a.connectionId ?? ''),
        status: String(a.status ?? 'idle'),
        model: a.model ? String(a.model) : null,
        workspace: a.workspace ? String(a.workspace) : null,
        contentHash: sha256(JSON.stringify(a)),
      }))
    } catch (err) {
      syncLogger.warn({ err }, 'Failed to discover agents from gateway')
      return []
    }
  },

  /**
   * 从磁盘发现 agent（扫描 agents 目录）
   */
  async discoverFromDisk(agentsDir?: string): Promise<DiscoveredAgent[]> {
    const dir = resolvePath(agentsDir ?? AGENTS_DIR)
    const discovered: DiscoveredAgent[] = []

    try {
      const entries = await readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        if (!entry.isDirectory()) continue

        const agentDir = join(dir, entry.name)
        let identity: Record<string, unknown> = {}
        let soul: string | null = null

        // 读取 identity.md / identity.json
        try {
          const identityContent = await readFile(join(agentDir, 'identity.json'), 'utf-8')
          identity = JSON.parse(identityContent) as Record<string, unknown>
        } catch {
          // 没有 identity 文件，使用目录名
        }

        // 读取 soul.md
        try {
          soul = await readFile(join(agentDir, 'soul.md'), 'utf-8')
        } catch {
          // 没有 soul 文件
        }

        const content = JSON.stringify({ identity, soul })

        discovered.push({
          id: String(identity.id ?? entry.name),
          name: String(identity.name ?? entry.name),
          source: 'local',
          sourceRef: agentDir,
          emoji: identity.emoji ? String(identity.emoji) : null,
          role: identity.role ? String(identity.role) : null,
          model: identity.model ? String(identity.model) : null,
          workspace: identity.workspace ? String(identity.workspace) : null,
          soul,
          config: identity.config ?? null,
          contentHash: sha256(content),
        })
      }
    } catch (err) {
      syncLogger.debug({ err, dir }, 'Agents directory not accessible')
    }

    return discovered
  },

  /**
   * 从配置文件发现 agent
   */
  async discoverFromConfig(configPath?: string): Promise<DiscoveredAgent[]> {
    const path = resolvePath(configPath ?? OPENCLAW_CONFIG)

    try {
      const content = await readFile(path, 'utf-8')
      const config = JSON.parse(content) as { agents?: Record<string, unknown>[] }

      if (!Array.isArray(config.agents)) return []

      return config.agents.map((a) => ({
        id: String(a.id ?? a.name),
        name: String(a.name ?? 'unnamed'),
        source: 'config' as const,
        sourceRef: path,
        emoji: a.emoji ? String(a.emoji) : null,
        role: a.role ? String(a.role) : null,
        model: a.model ? String(a.model) : null,
        workspace: a.workspace ? String(a.workspace) : null,
        config: a.config ?? null,
        contentHash: sha256(JSON.stringify(a)),
      }))
    } catch (err) {
      syncLogger.debug({ err, path }, 'Config file not accessible')
      return []
    }
  },

  /**
   * 合并引擎
   */
  async syncAgents(options?: {
    gatewayClient?: GatewayClient
    dryRun?: boolean
  }): Promise<SyncResult> {
    const result: SyncResult = { created: [], updated: [], offlined: [] }

    // 1. 并行调用发现器
    const [gatewayAgents, diskAgents, configAgents] = await Promise.all([
      options?.gatewayClient ? this.discoverFromGateway(options.gatewayClient) : [],
      this.discoverFromDisk(),
      this.discoverFromConfig(),
    ])

    // 2. 去重合并（gateway 优先）
    const merged = new Map<string, DiscoveredAgent>()

    // config 最低优先级
    for (const a of configAgents) merged.set(a.id, a)
    // disk 覆盖 config
    for (const a of diskAgents) merged.set(a.id, a)
    // gateway 最高优先级
    for (const a of gatewayAgents) merged.set(a.id, a)

    syncLogger.info(
      { gateway: gatewayAgents.length, disk: diskAgents.length, config: configAgents.length, merged: merged.size },
      'Discovery complete',
    )

    if (options?.dryRun) {
      // dryRun 只返回预览
      const existing = await agentRepo.findAll()
      const existingIds = new Set(existing.map((a) => a.id))

      for (const [id, agent] of merged) {
        if (!existingIds.has(id)) {
          result.created.push(id)
        } else {
          const ex = existing.find((a) => a.id === id)
          if (ex && ex.contentHash !== agent.contentHash) {
            result.updated.push(id)
          }
        }
      }

      // 发现消失的 agent
      for (const ex of existing) {
        if (ex.source !== 'local' && !merged.has(ex.id)) {
          // 只标记非手动创建的
        }
      }

      return result
    }

    // 3. 实际同步
    const existing = await agentRepo.findAll()
    const existingMap = new Map<string, AgentRow>(existing.map((a) => [a.id, a]))

    for (const [id, discovered] of merged) {
      const ex = existingMap.get(id)

      if (!ex) {
        // 新增
        const insert: AgentInsert = {
          id: discovered.id,
          name: discovered.name,
          emoji: discovered.emoji ?? null,
          role: discovered.role ?? 'agent',
          model: discovered.model ?? null,
          workspace: discovered.workspace ?? null,
          status: 'offline',
          source: discovered.source,
          sourceRef: discovered.sourceRef ?? null,
          soul: discovered.soul ?? null,
          config: discovered.config ?? null,
          contentHash: discovered.contentHash ?? null,
          lastSyncAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await agentRepo.create(insert)
        await activityRepo.log('agent', id, 'synced', 'sync', { source: discovered.source, action: 'created' })
        result.created.push(id)
      } else if (ex.contentHash !== discovered.contentHash) {
        // 变更
        await agentRepo.update(id, {
          name: discovered.name,
          emoji: discovered.emoji ?? ex.emoji,
          role: discovered.role ?? ex.role,
          model: discovered.model ?? ex.model,
          workspace: discovered.workspace ?? ex.workspace,
          source: discovered.source,
          sourceRef: discovered.sourceRef ?? ex.sourceRef,
          soul: discovered.soul ?? ex.soul,
          config: discovered.config ?? ex.config,
          contentHash: discovered.contentHash ?? ex.contentHash,
          lastSyncAt: new Date(),
        })
        await activityRepo.log('agent', id, 'synced', 'sync', { source: discovered.source, action: 'updated' })
        result.updated.push(id)
      }

      existingMap.delete(id)
    }

    // 4. 标记消失的 agent 为 offline（仅非用户创建的）
    for (const [id, ex] of existingMap) {
      if (ex.source !== 'local' && ex.status !== 'offline') {
        await agentRepo.update(id, { status: 'offline' })
        await activityRepo.log('agent', id, 'status_changed', 'sync', { status: 'offline' })
        result.offlined.push(id)
      }
    }

    syncLogger.info(result, 'Sync complete')
    emitEvent('agent.synced', { ...result })

    return result
  },
}
