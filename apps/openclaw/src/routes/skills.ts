/**
 * Skill 路由（薄壳）
 *
 * @module routes/skills
 */

import { Hono } from 'hono'
import { skillService } from '../services/skill.js'
import { ok } from '../http/response.js'

// ── 内部路由（/api/skills） ──────────────────────────────

export const skillRoutes = new Hono()

skillRoutes.get('/', async (c) => {
  const skills = await skillService.list()
  return ok(c, skills)
})

skillRoutes.get('/:id', async (c) => {
  const skill = await skillService.getById(c.req.param('id'))
  return ok(c, skill)
})

skillRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const skill = await skillService.create(body)
  return ok(c, skill, 201)
})

skillRoutes.put('/:id', async (c) => {
  const body = await c.req.json()
  const skill = await skillService.update(c.req.param('id'), body)
  return ok(c, skill)
})

skillRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param()
  await skillService.remove(id)
  return ok(c, { id })
})

// ── 开放路由（/open/skills） ─────────────────────────────

export const skillOpenRoutes = new Hono()

skillOpenRoutes.get('/', async (c) => {
  const skills = await skillService.list()
  return ok(c, skills)
})

skillOpenRoutes.get('/:id', async (c) => {
  const skill = await skillService.getById(c.req.param('id'))
  return ok(c, skill)
})
