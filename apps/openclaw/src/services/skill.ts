/**
 * Skill Service
 *
 * @module services/skill
 */

import { skillRepo } from '../db/repo/skill.js'
import { CODE } from '../http/code.js'
import { generateId } from '../utils/id.js'
import { logger } from '../utils/logger.js'
import { BaseService } from './base.js'
import type { SkillInsert, SkillRow } from '../db/schema.js'
import type { SkillCreateInput, SkillUpdateInput } from '../schemas/skill.js'

class SkillService extends BaseService<SkillRow, SkillInsert, SkillCreateInput, SkillUpdateInput> {
  constructor() {
    super({
      entity: 'skill',
      notFoundCode: CODE.SKILL_NOT_FOUND,
      repo: skillRepo,
      logger: logger.child({ module: 'skill' }),
    })
  }

  protected toInsert(data: SkillCreateInput): SkillInsert {
    const now = new Date()
    return {
      id: data.id ?? generateId(),
      name: data.name,
      description: data.description ?? null,
      source: data.source ?? 'local',
      sourceRef: data.sourceRef ?? null,
      contentHash: data.contentHash ?? null,
      createdAt: now,
      updatedAt: now,
    }
  }

  protected createDetail(data: SkillCreateInput): Record<string, unknown> {
    return { name: data.name }
  }

  protected removeDetail(existing: SkillRow): Record<string, unknown> {
    return { name: existing.name }
  }
}

export const skillService = new SkillService()
