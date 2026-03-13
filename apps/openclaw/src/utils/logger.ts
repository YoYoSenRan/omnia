/**
 * 日志模块
 *
 * 基于 pino 的结构化日志系统。
 * 开发环境使用 pino-pretty 格式化输出，生产环境输出 JSON。
 *
 * @module logger
 */

import pino from "pino"
import { LOG_LEVEL, IS_DEV } from "../utils/env.js"

/** 根日志实例 */
export const logger = pino({
  name: "openclaw",
  level: LOG_LEVEL,
  /* 开发环境启用 pino-pretty 彩色输出 */
  transport: IS_DEV ? { target: "pino-pretty", options: { colorize: true } } : undefined,
})

/** 网关模块日志 */
export const gwLogger = logger.child({ module: "gateway" })

/** 同步模块日志 */
export const syncLogger = logger.child({ module: "sync" })

/** 事件总线日志 */
export const eventLogger = logger.child({ module: "events" })

/** 数据库模块日志 */
export const dbLogger = logger.child({ module: "db" })
