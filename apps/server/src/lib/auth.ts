/**
 * 鉴权中间件
 *
 * server 服务只需要 API Key 鉴权（web 前端访问）。
 *
 * @module auth
 */

import type { Context, Next } from 'hono'
import { CODE } from './code.js'
import { fail } from './response.js'

/**
 * API Key 鉴权中间件
 */
export function apiKeyAuth(apiKey: string) {
  return async (c: Context, next: Next) => {
    const auth = c.req.header('Authorization')
    if (!auth || auth !== `Bearer ${apiKey}`) {
      return fail(c, 401, CODE.UNAUTHORIZED, 'Invalid API key')
    }
    return next()
  }
}
