/**
 * Agent Service
 *
 * @module services/agent
 */

import { agentRepo } from '../db/repo/agent.js'
import { activityRepo } from '../db/repo/activity.js'
import { emitEvent } from '../events/bus.js'
import { AppError } from '../http/errors.js'
import { CODE } from '../http/code.js'
import { generateId } from '../utils/id.js'
import { logger } from '../utils/logger.js'
import type { AgentInsert, AgentRow } from '../db/schema.js'

export const agentService = {
  async list(): Promise<AgentRow[]> {
    return agentRepo.findAll()
  },

  async getById(id: string): Promise<AgentRow> {
    const agent = await agentRepo.findById(id)
    if (!agent) {
      throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${id}' not found`)
    }
    return agent
  },

  async create(data: {
    id?: string
    name: string
    emoji?: string | null
    role?: string | null
    model?: string | null
    workspace?: string | null
    source?: string
    sourceRef?: string | null
    soul?: string | null
    config?: unknown
  }): Promise<AgentRow> {
    const id = data.id ?? generateId()
    const now = new Date()

    const insert: AgentInsert = {
      id,
      name: data.name,
      emoji: data.emoji ?? null,
      role: data.role ?? 'agent',
      model: data.model ?? null,
      workspace: data.workspace ?? null,
      status: 'offline',
      source: data.source ?? 'local',
      sourceRef: data.sourceRef ?? null,
      soul: data.soul ?? null,
      config: data.config ?? null,
      createdAt: now,
      updatedAt: now,
    }

    const agent = await agentRepo.create(insert)

    await activityRepo.log('agent', id, 'created', 'user', { name: data.name, source: insert.source })
    logger.info({ agentId: id, name: data.name }, 'Agent created')
    emitEvent('agent.status', { agentId: id, status: 'offline' })

    return agent
  },

  async update(id: string, data: Partial<{
    name: string
    emoji: string | null
    role: string | null
    model: string | null
    workspace: string | null
    status: string
    soul: string | null
    config: unknown
  }>): Promise<AgentRow> {
    const existing = await this.getById(id)

    const updated = await agentRepo.update(id, data)
    if (!updated) {
      throw new AppError(500, CODE.INTERNAL_ERROR, `Failed to update agent '${id}'`)
    }

    const changedFields = Object.keys(data)
    await activityRepo.log('agent', id, 'updated', 'user', { fields: changedFields })
    logger.info({ agentId: id }, 'Agent updated')

    if (data.status && data.status !== existing.status) {
      emitEvent('agent.status', { agentId: id, status: data.status })
    }

    return updated
  },

  async remove(id: string): Promise<void> {
    const existing = await this.getById(id)
    await agentRepo.remove(id)

    await activityRepo.log('agent', id, 'deleted', 'user', { name: existing.name })
    logger.info({ agentId: id, name: existing.name }, 'Agent deleted')
  },

  async updateStatus(id: string, status: string): Promise<AgentRow> {
    const agent = await agentRepo.update(id, { status, lastActiveAt: new Date() })
    if (!agent) {
      throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${id}' not found`)
    }

    await activityRepo.log('agent', id, 'status_changed', 'system', { status })
    emitEvent('agent.status', { agentId: id, status })

    return agent
  },

  async getSoul(id: string): Promise<string> {
    const agent = await this.getById(id)
    return agent.soul ?? ''
  },

  async updateSoul(id: string, content: string): Promise<void> {
    await this.getById(id)
    await agentRepo.update(id, { soul: content })

    await activityRepo.log('agent', id, 'updated', 'user', { field: 'soul' })
    logger.info({ agentId: id }, 'Agent soul updated')
  },
}
