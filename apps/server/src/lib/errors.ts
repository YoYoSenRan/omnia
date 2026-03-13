/**
 * 自定义错误类
 *
 * @module errors
 */

/**
 * 业务错误类
 *
 * 携带 HTTP 状态码和业务码，供全局错误处理中间件拦截。
 */
export class AppError extends Error {
  constructor(
    /** HTTP 状态码 */
    public httpStatus: number,
    /** 业务错误码 */
    public code: number,
    /** 错误消息 */
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}
