/**
 * 环境变量配置
 *
 * 统一管理 server 服务的所有环境变量。
 *
 * @module env
 */

/** 服务端口 */
export const PORT = Number(process.env.PORT ?? 3002)

/** PostgreSQL 连接地址（omnia_app 数据库） */
export const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://omnia:omnia@localhost:5432/omnia_app'

/** OpenClaw 服务地址 */
export const OPENCLAW_URL = process.env.OPENCLAW_URL ?? 'http://localhost:3001'

/** Web 前端 API Key */
export const API_KEY = process.env.API_KEY ?? 'dev-app-api-key'

/** Service Token（调用 openclaw /open/* 接口） */
export const SERVICE_TOKEN = process.env.SERVICE_TOKEN ?? 'dev-service-token'

/** 日志级别 */
export const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info'

/** 当前运行环境 */
export const NODE_ENV = process.env.NODE_ENV ?? 'development'

/** 是否为开发环境 */
export const IS_DEV = NODE_ENV === 'development'

/** CORS 允许的来源 */
export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5174'
