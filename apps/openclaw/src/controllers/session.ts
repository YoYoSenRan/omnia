/**
 * Session Controller
 *
 * @module controllers/session
 */

import type { Context } from 'hono'
import { sessionService } from '../services/session.js'
import { ok } from '../http/response.js'
import { SessionCreateSchema } from '../schemas/session.js'

export const sessionController = {
  list: async (c: Context) => {
    const sessions = await sessionService.list()
    return ok(c, sessions)
  },

  getById: async (c: Context) => {
    const session = await sessionService.getById(c.req.param('id')!)
    return ok(c, session)
  },

  create: async (c: Context) => {
    const body = SessionCreateSchema.parse(await c.req.json())
    const session = await sessionService.create(body)
    return ok(c, session, 201)
  },

  /** 开放路由创建（source = system） */
  createFromOpen: async (c: Context) => {
    const body = SessionCreateSchema.parse(await c.req.json())
    const session = await sessionService.create(body, 'system')
    return ok(c, session, 201)
  },

  close: async (c: Context) => {
    const session = await sessionService.close(c.req.param('id')!)
    return ok(c, session)
  },
}
