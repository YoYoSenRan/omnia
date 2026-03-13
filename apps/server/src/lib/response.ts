/**
 * 统一响应格式
 *
 * @module response
 */

import type { Context } from 'hono'
import { CODE } from './code.js'

/** API 响应格式 */
export interface ApiResponse<T = unknown> {
  ok: boolean
  code: number
  message: string
  data: T | null
}

/**
 * 返回成功响应
 */
export function ok<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json(
    { ok: true, code: CODE.SUCCESS, message: 'success', data } satisfies ApiResponse<T>,
    status,
  )
}

/**
 * 返回失败响应
 */
export function fail(c: Context, httpStatus: number, code: number, message: string) {
  return c.json(
    { ok: false, code, message, data: null } satisfies ApiResponse<null>,
    httpStatus as Parameters<typeof c.json>[1],
  )
}
