/**
 * Skill Service
 *
 * @module services/skill
 */

import { skillRepo } from '../db/repo/skill.js'
import { activityRepo } from '../db/repo/activity.js'
import { AppError } from '../http/errors.js'
import { CODE } from '../http/code.js'
import { generateId } from '../utils/id.js'
import { logger } from '../utils/logger.js'
import type { SkillInsert, SkillRow } from '../db/schema.js'

export const skillService = {
  async list(): Promise<SkillRow[]> {
    return skillRepo.findAll()
  },

  async getById(id: string): Promise<SkillRow> {
    const skill = await skillRepo.findById(id)
    if (!skill) {
      throw new AppError(404, CODE.SKILL_NOT_FOUND, `Skill '${id}' not found`)
    }
    return skill
  },

  async create(data: {
    id?: string
    name: string
    description?: string | null
    source?: string
    sourceRef?: string | null
    contentHash?: string | null
  }): Promise<SkillRow> {
    const id = data.id ?? generateId()
    const now = new Date()

    const insert: SkillInsert = {
      id,
      name: data.name,
      description: data.description ?? null,
      source: data.source ?? 'local',
      sourceRef: data.sourceRef ?? null,
      contentHash: data.contentHash ?? null,
      createdAt: now,
      updatedAt: now,
    }

    const skill = await skillRepo.create(insert)

    await activityRepo.log('skill', id, 'created', 'user', { name: data.name })
    logger.info({ skillId: id, name: data.name }, 'Skill created')

    return skill
  },

  async update(id: string, data: Partial<{
    name: string
    description: string | null
    contentHash: string | null
    sourceRef: string | null
  }>): Promise<SkillRow> {
    await this.getById(id)

    const updated = await skillRepo.update(id, data)
    if (!updated) {
      throw new AppError(500, CODE.INTERNAL_ERROR, `Failed to update skill '${id}'`)
    }

    await activityRepo.log('skill', id, 'updated', 'user', { fields: Object.keys(data) })
    logger.info({ skillId: id }, 'Skill updated')

    return updated
  },

  async remove(id: string): Promise<void> {
    const existing = await this.getById(id)
    await skillRepo.remove(id)

    await activityRepo.log('skill', id, 'deleted', 'user', { name: existing.name })
    logger.info({ skillId: id, name: existing.name }, 'Skill deleted')
  },
}
