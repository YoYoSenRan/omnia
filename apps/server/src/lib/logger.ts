/**
 * 日志模块
 *
 * server 服务的 pino 日志实例。
 *
 * @module logger
 */

import pino from 'pino'
import { LOG_LEVEL, IS_DEV } from './env.js'

/** 根日志实例 */
export const logger = pino({
  name: 'server',
  level: LOG_LEVEL,
  transport: IS_DEV
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
})
