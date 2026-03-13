/**
 * 鉴权中间件
 *
 * @module middleware/auth
 */

import type { Context, Next } from "hono"
import { CODE } from "../http/code.js"
import { fail } from "../http/response.js"

/**
 * API Key 鉴权中间件
 */
export function apiKeyAuth(apiKey: string) {
  return async (c: Context, next: Next) => {
    const auth = c.req.header("Authorization")
    if (!auth || auth !== `Bearer ${apiKey}`) {
      return fail(c, 401, CODE.UNAUTHORIZED, "Invalid API key")
    }
    return next()
  }
}

/**
 * Service Token 鉴权中间件
 */
export function serviceAuth(serviceToken: string) {
  return async (c: Context, next: Next) => {
    const token = c.req.header("X-Service-Token")
    if (!token || token !== serviceToken) {
      return fail(c, 401, CODE.UNAUTHORIZED, "Invalid service token")
    }
    return next()
  }
}
