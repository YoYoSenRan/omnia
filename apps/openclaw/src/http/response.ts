/**
 * 统一响应格式工具函数
 *
 * 所有 API 响应都通过 ok() 和 fail() 返回，
 * 确保前端拿到的数据结构一致。
 *
 * @module response
 */

import type { Context } from 'hono'
import { CODE } from './code.js'

/**
 * API 响应格式
 *
 * @template T - 响应数据类型
 */
export interface ApiResponse<T = unknown> {
  /** 请求是否成功 */
  ok: boolean
  /** 业务状态码，0=成功，非 0=错误 */
  code: number
  /** 人类可读的消息 */
  message: string
  /** 响应数据或 null */
  data: T | null
}

/**
 * 返回成功响应
 *
 * @param c - Hono 上下文
 * @param data - 响应数据
 * @param status - HTTP 状态码，默认 200
 * @returns JSON 响应
 *
 * @example
 * ```ts
 * return ok(c, { agents: [...] })
 * return ok(c, { id: 'agent-001' }, 201)
 * ```
 */
export function ok<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json(
    { ok: true, code: CODE.SUCCESS, message: 'success', data } satisfies ApiResponse<T>,
    status,
  )
}

/**
 * 返回失败响应
 *
 * @param c - Hono 上下文
 * @param httpStatus - HTTP 状态码
 * @param code - 业务错误码
 * @param message - 错误消息
 * @returns JSON 响应
 *
 * @example
 * ```ts
 * return fail(c, 404, CODE.AGENT_NOT_FOUND, 'Agent not found')
 * ```
 */
export function fail(c: Context, httpStatus: number, code: number, message: string) {
  return c.json(
    { ok: false, code, message, data: null } satisfies ApiResponse<null>,
    httpStatus as Parameters<typeof c.json>[1],
  )
}
