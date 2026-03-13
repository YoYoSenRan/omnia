/**
 * Session Service
 *
 * @module services/session
 */

import { sessionRepo } from '../db/repo/session.js'
import { activityRepo } from '../db/repo/activity.js'
import { agentRepo } from '../db/repo/agent.js'
import { emitEvent } from '../events/bus.js'
import { AppError } from '../http/errors.js'
import { CODE } from '../http/code.js'
import { generateId } from '../utils/id.js'
import { logger } from '../utils/logger.js'
import type { SessionRow } from '../db/schema.js'

export const sessionService = {
  async list(): Promise<SessionRow[]> {
    return sessionRepo.findAll()
  },

  async getById(id: string): Promise<SessionRow> {
    const session = await sessionRepo.findById(id)
    if (!session) {
      throw new AppError(404, CODE.SESSION_NOT_FOUND, `Session '${id}' not found`)
    }
    return session
  },

  async create(data: {
    id?: string
    agentId: string
    metadata?: unknown
  }, source: string = 'user'): Promise<SessionRow> {
    // 验证关联的 Agent 存在
    const agent = await agentRepo.findById(data.agentId)
    if (!agent) {
      throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${data.agentId}' not found`)
    }

    const id = data.id ?? generateId()

    const session = await sessionRepo.create({
      id,
      agentId: data.agentId,
      status: 'open',
      metadata: data.metadata ?? null,
      createdAt: new Date(),
    })

    await activityRepo.log('session', id, 'created', source, { agentId: data.agentId })
    logger.info({ sessionId: id, agentId: data.agentId }, 'Session created')
    emitEvent('session.created', { sessionId: id, agentId: data.agentId })

    return session
  },

  async close(id: string): Promise<SessionRow> {
    const existing = await this.getById(id)

    if (existing.status === 'closed') {
      throw new AppError(409, CODE.SESSION_CLOSED, `Session '${id}' is already closed`)
    }

    const updated = await sessionRepo.update(id, {
      status: 'closed',
      closedAt: new Date(),
    })
    if (!updated) {
      throw new AppError(500, CODE.INTERNAL_ERROR, `Failed to close session '${id}'`)
    }

    await activityRepo.log('session', id, 'updated', 'user', { status: 'closed' })
    logger.info({ sessionId: id }, 'Session closed')

    return updated
  },
}
