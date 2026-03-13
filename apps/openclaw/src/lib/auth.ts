/**
 * 鉴权中间件
 *
 * 提供两种鉴权策略：
 * - API Key：用于 console 前端访问 /api/* 路由
 * - Service Token：用于 server 服务访问 /open/* 路由
 *
 * @module auth
 */

import type { Context, Next } from 'hono'
import { CODE } from './code.js'
import { fail } from './response.js'

/**
 * API Key 鉴权中间件
 *
 * 从 Authorization 头提取 Bearer token，与配置的 API Key 比对。
 * 用于保护 /api/* 路由（console 前端访问）。
 *
 * @param apiKey - 预配置的 API Key
 * @returns Hono 中间件函数
 *
 * @example
 * ```ts
 * app.use('/api/*', apiKeyAuth(API_KEY))
 * ```
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

/**
 * Service Token 鉴权中间件
 *
 * 从 X-Service-Token 头提取 token，与配置的 Service Token 比对。
 * 用于保护 /open/* 路由（server 服务间调用）。
 *
 * @param serviceToken - 预配置的 Service Token
 * @returns Hono 中间件函数
 *
 * @example
 * ```ts
 * app.use('/open/*', serviceAuth(SERVICE_TOKEN))
 * ```
 */
export function serviceAuth(serviceToken: string) {
  return async (c: Context, next: Next) => {
    const token = c.req.header('X-Service-Token')
    if (!token || token !== serviceToken) {
      return fail(c, 401, CODE.UNAUTHORIZED, 'Invalid service token')
    }
    return next()
  }
}
