/**
 * 网关配置发现
 *
 * 从环境变量和本地 openclaw.json 配置文件中检测网关连接参数。
 * 优先级：环境变量 > 配置文件 > 默认值。
 *
 * @module gateway/config
 */

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { gwLogger } from "../utils/logger.js"

// ── 环境变量 ─────────────────────────────────────────

const ENV_GATEWAY_URL = process.env.GATEWAY_URL?.trim() ?? ""
const ENV_GATEWAY_HOST = process.env.GATEWAY_HOST?.trim() ?? ""
const ENV_GATEWAY_PORT = process.env.GATEWAY_PORT?.trim() ?? ""
const ENV_GATEWAY_TOKEN = process.env.GATEWAY_TOKEN?.trim() ?? ""
const ENV_OPENCLAW_CONFIG = process.env.OPENCLAW_CONFIG?.trim() ?? "~/.openclaw/openclaw.json"

const DEFAULT_HOST = "127.0.0.1"
const DEFAULT_PORT = 18789

// ── 配置文件类型 ─────────────────────────────────────

export interface OpenClawConfig {
  gateway?: {
    port?: number
    mode?: string
    bind?: string
    auth?: {
      mode?: string
      token?: string
      password?: string
    }
  }
  agents?: {
    defaults?: {
      model?: { primary?: string; fallbacks?: string[] } | string
      workspace?: string
      [k: string]: unknown
    }
    list?: Array<{
      id: string
      name?: string
      default?: boolean
      workspace?: string
      model?: { primary?: string } | string
      [k: string]: unknown
    }>
  }
}

// ── 路径工具 ─────────────────────────────────────────

function resolvePath(p: string): string {
  if (p.startsWith("~")) {
    return join(process.env.HOME ?? "/root", p.slice(1))
  }
  return p
}

// ── 配置文件读取 ─────────────────────────────────────

/** 读取 openclaw.json，失败时返回 null */
export function readOpenClawConfig(configPath?: string): OpenClawConfig | null {
  const path = resolvePath(configPath ?? ENV_OPENCLAW_CONFIG)
  try {
    const raw = readFileSync(path, "utf-8")
    return JSON.parse(raw) as OpenClawConfig
  } catch {
    gwLogger.debug({ path }, "openclaw.json not accessible")
    return null
  }
}

/** 获取 openclaw.json 的解析路径 */
export function getConfigPath(): string {
  return resolvePath(ENV_OPENCLAW_CONFIG)
}

// ── 网关发现 ─────────────────────────────────────────

/**
 * 检测网关 WebSocket URL
 *
 * 优先级：GATEWAY_URL > (GATEWAY_HOST + GATEWAY_PORT) > (config.gateway.port) > 默认
 * 返回空字符串表示不连接网关
 */
export function detectGatewayUrl(): string {
  // 1. 显式 URL
  if (ENV_GATEWAY_URL) return ENV_GATEWAY_URL

  // 2. 从 host + port 拼接
  const host = ENV_GATEWAY_HOST || DEFAULT_HOST
  let port: number | null = null

  // 环境变量 port
  if (ENV_GATEWAY_PORT) {
    const p = Number(ENV_GATEWAY_PORT)
    if (Number.isFinite(p) && p > 0) port = p
  }

  // 配置文件 port
  if (port === null) {
    const config = readOpenClawConfig()
    const cfgPort = config?.gateway?.port
    if (cfgPort && Number.isFinite(cfgPort) && cfgPort > 0) port = cfgPort
  }

  // 有 port 才拼 URL（没有任何配置时不连接）
  if (port !== null) {
    return `ws://${host}:${port}`
  }

  // 环境变量有 host 但没 port，用默认 port
  if (ENV_GATEWAY_HOST) {
    return `ws://${host}:${DEFAULT_PORT}`
  }

  return ""
}

/**
 * 检测网关 Token
 *
 * 优先级：GATEWAY_TOKEN > config.gateway.auth.token/password
 * 每次调用都重新读取配置文件，确保 Gateway 重启后拿到新 Token
 */
export function detectGatewayToken(): string {
  // 1. 环境变量
  if (ENV_GATEWAY_TOKEN) return ENV_GATEWAY_TOKEN

  // 2. 配置文件
  const config = readOpenClawConfig()
  const auth = config?.gateway?.auth
  if (!auth) return ""

  if (auth.mode === "password") {
    return auth.password?.trim() ?? ""
  }
  return auth.token?.trim() ?? ""
}

// ── Agent 配置工具 ───────────────────────────────────

/**
 * 从 model 配置中提取 primary model 字符串
 *
 * model 可能是字符串或 { primary: string } 对象
 */
export function resolveModelString(model: unknown): string | null {
  if (typeof model === "string") return model
  if (model && typeof model === "object" && "primary" in model) {
    return String((model as { primary: unknown }).primary)
  }
  return null
}
