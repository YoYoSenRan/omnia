/**
 * 环境变量配置
 *
 * 统一管理所有环境变量的读取与默认值。
 * 启动时验证必要的环境变量是否已配置。
 *
 * @module env
 */

/** 服务端口 */
export const PORT = Number(process.env.PORT ?? 3301)

/** PostgreSQL 连接地址 */
export const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://omnia:omnia@localhost:5432/omnia_core'

/** OpenClaw 网关 WebSocket 地址 */
export const GATEWAY_URL = process.env.GATEWAY_URL ?? ''

/** 网关连接认证 Token */
export const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN ?? ''

/** 控制台 API Key（console 前端鉴权） */
export const API_KEY = process.env.API_KEY ?? 'dev-api-key'

/** 业务服务 Service Token（server 服务间鉴权） */
export const SERVICE_TOKEN = process.env.SERVICE_TOKEN ?? 'dev-service-token'

/** Agent 定义文件目录 */
export const AGENTS_DIR = process.env.AGENTS_DIR ?? '~/.openclaw/agents'

/** OpenClaw 配置文件路径 */
export const OPENCLAW_CONFIG = process.env.OPENCLAW_CONFIG ?? '~/.openclaw/openclaw.json'

/** 日志级别 */
export const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info'

/** 当前运行环境 */
export const NODE_ENV = process.env.NODE_ENV ?? 'development'

/** 是否为开发环境 */
export const IS_DEV = NODE_ENV === 'development'

/** CORS 允许的来源 */
export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5301'
