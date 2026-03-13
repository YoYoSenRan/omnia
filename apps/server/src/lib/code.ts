/**
 * 业务状态码常量
 *
 * server 服务复用与 openclaw 相同的编码规则。
 *
 * @module code
 */

export const CODE = {
  SUCCESS: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,

  /** Core 服务不可用 */
  CORE_UNAVAILABLE: 50002,
} as const
