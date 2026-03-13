/**
 * 业务状态码常量
 *
 * 编码规则：5 位数字 XXYYZ
 * - XX：模块（00=通用，10=Agent，20=Skill，30=Task，40=Session，50=Gateway）
 * - YY：错误序号
 * - Z：保留（默认 0）
 *
 * @module code
 */

export const CODE = {
  // ── 成功 ──────────────────────────────────────────
  /** 操作成功 */
  SUCCESS: 0,

  // ── 通用错误 00xxx ────────────────────────────────
  /** 请求参数校验失败 */
  BAD_REQUEST: 400,
  /** 未认证或 token 无效 */
  UNAUTHORIZED: 401,
  /** 无权限访问 */
  FORBIDDEN: 403,
  /** 资源不存在 */
  NOT_FOUND: 404,
  /** 服务端未捕获异常 */
  INTERNAL_ERROR: 500,

  // ── Agent 10xxx ───────────────────────────────────
  /** Agent 不存在 */
  AGENT_NOT_FOUND: 10001,
  /** Agent 名称重复 */
  AGENT_NAME_DUPLICATE: 10002,
  /** Agent 同步失败 */
  AGENT_SYNC_FAILED: 10003,
  /** Agent 状态非法 */
  AGENT_STATUS_INVALID: 10004,
  /** Soul 读取失败 */
  AGENT_SOUL_READ_FAILED: 10005,
  /** Soul 写入失败 */
  AGENT_SOUL_WRITE_FAILED: 10006,

  // ── Skill 20xxx ───────────────────────────────────
  /** Skill 不存在 */
  SKILL_NOT_FOUND: 20001,
  /** Skill 同步失败 */
  SKILL_SYNC_FAILED: 20002,

  // ── Task 30xxx ────────────────────────────────────
  /** Task 不存在 */
  TASK_NOT_FOUND: 30001,
  /** Task 状态流转非法 */
  TASK_STATUS_INVALID: 30002,
  /** Task 分配失败 */
  TASK_ASSIGN_FAILED: 30003,
  /** Task 执行超时 */
  TASK_TIMEOUT: 30004,

  // ── Session 40xxx ─────────────────────────────────
  /** Session 不存在 */
  SESSION_NOT_FOUND: 40001,
  /** Session 已关闭 */
  SESSION_CLOSED: 40002,

  // ── Gateway 50xxx ─────────────────────────────────
  /** 网关连接失败 */
  GATEWAY_CONNECT_FAILED: 50001,
  /** 网关未连接 */
  GATEWAY_DISCONNECTED: 50002,
  /** 网关认证失败 */
  GATEWAY_AUTH_FAILED: 50003,
  /** 网关请求超时 */
  GATEWAY_TIMEOUT: 50004,
} as const

/** 业务状态码类型 */
export type BusinessCode = (typeof CODE)[keyof typeof CODE]
