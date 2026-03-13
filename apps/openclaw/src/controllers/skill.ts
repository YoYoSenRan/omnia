/**
 * Skill Controller
 *
 * @module controllers/skill
 */

import type { Context } from "hono"
import { skillService } from "../services/skill.js"
import { ok } from "../http/response.js"
import { SkillCreateSchema, SkillUpdateSchema } from "../validators/skill.js"

export const skillController = {
  list: async (c: Context) => {
    const skills = await skillService.list()
    return ok(c, skills)
  },

  getById: async (c: Context) => {
    const skill = await skillService.getById(c.req.param("id")!)
    return ok(c, skill)
  },

  create: async (c: Context) => {
    const body = SkillCreateSchema.parse(await c.req.json())
    const skill = await skillService.create(body)
    return ok(c, skill, 201)
  },

  update: async (c: Context) => {
    const body = SkillUpdateSchema.parse(await c.req.json())
    const skill = await skillService.update(c.req.param("id")!, body)
    return ok(c, skill)
  },

  remove: async (c: Context) => {
    const { id } = c.req.param()
    await skillService.remove(id)
    return ok(c, { id })
  },
}
