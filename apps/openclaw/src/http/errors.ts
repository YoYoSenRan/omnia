/**
 * 自定义错误类
 *
 * 统一的业务错误类型，携带 HTTP 状态码和业务错误码，
 * 供全局错误处理中间件捕获并格式化为统一响应。
 *
 * @module errors
 */

/**
 * 业务错误类
 *
 * 抛出此类错误会被全局错误处理中间件拦截，
 * 自动转换为统一的 API 错误响应格式。
 *
 * @example
 * ```ts
 * throw new AppError(404, CODE.AGENT_NOT_FOUND, 'Agent not found')
 * ```
 */
export class AppError extends Error {
  constructor(
    /** HTTP 状态码 */
    public httpStatus: number,
    /** 业务错误码（5 位数字） */
    public code: number,
    /** 人类可读的错误消息 */
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}
