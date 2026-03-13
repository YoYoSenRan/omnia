/**
 * Hono 应用初始化
 *
 * 配置全局中间件（CORS、请求日志、鉴权）、注册路由、
 * 设置全局错误处理和 404 兜底。
 *
 * 路由分组：
 * - /health — 无鉴权，健康检查
 * - /api/*  — API Key 鉴权，供 console 前端使用
 * - /open/* — Service Token 鉴权，供 server 服务间调用
 *
 * @module app
 */

/** 自定义 Hono 变量类型，供中间件注入使用 */
type AppVariables = {
  /** 请求唯一标识 */
  reqId: string
}

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { API_KEY, SERVICE_TOKEN, CORS_ORIGIN } from './lib/env.js'
import { logger } from './lib/logger.js'
import { AppError } from './lib/errors.js'
import { CODE } from './lib/code.js'
import { fail } from './lib/response.js'
import { apiKeyAuth, serviceAuth } from './lib/auth.js'

/* 路由模块 */
import { systemRoutes } from './routes/system.js'
import { agentRoutes, agentOpenRoutes } from './routes/agents.js'
import { skillRoutes, skillOpenRoutes } from './routes/skills.js'
import { taskRoutes, taskOpenRoutes } from './routes/tasks.js'
import { sessionRoutes, sessionOpenRoutes } from './routes/sessions.js'
import { handleSSE } from './events/sse.js'

/** Hono 应用实例 */
export const app = new Hono<{ Variables: AppVariables }>()

// ── 全局中间件 ────────────────────────────────────────────

/* CORS 配置 */
app.use(
  '*',
  cors({
    origin: CORS_ORIGIN,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Service-Token'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
)

/* 请求日志（开发环境使用 Hono 内置 logger） */
app.use('*', honoLogger())

/* 请求 ID 注入 + 结构化日志 */
app.use('*', async (c, next) => {
  const reqId = c.req.header('X-Request-Id') ?? crypto.randomUUID()
  c.set('reqId', reqId)
  c.header('X-Request-Id', reqId)

  const start = Date.now()
  await next()
  const duration = Date.now() - start

  logger.info(
    {
      reqId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration,
    },
    'Request completed',
  )
})

// ── 公开路由（无鉴权） ───────────────────────────────────

app.route('/', systemRoutes)

// ── 内部路由（API Key 鉴权） ─────────────────────────────

app.use('/api/*', apiKeyAuth(API_KEY))

/* SSE 事件流 */
app.get('/api/events/stream', handleSSE)

/* 业务路由 */
app.route('/api/agents', agentRoutes)
app.route('/api/skills', skillRoutes)
app.route('/api/tasks', taskRoutes)
app.route('/api/sessions', sessionRoutes)

// ── 开放路由（Service Token 鉴权） ──────────────────────

app.use('/open/*', serviceAuth(SERVICE_TOKEN))

app.route('/open/agents', agentOpenRoutes)
app.route('/open/skills', skillOpenRoutes)
app.route('/open/tasks', taskOpenRoutes)
app.route('/open/sessions', sessionOpenRoutes)

// ── 全局错误处理 ──────────────────────────────────────────

/**
 * 全局错误处理器
 *
 * - AppError：业务错误，返回对应的 HTTP 状态码和业务码
 * - 其他错误：未捕获异常，返回 500
 */
app.onError((err, c) => {
  const reqId = c.get('reqId') as string | undefined

  if (err instanceof AppError) {
    logger.warn({ reqId, code: err.code, err }, err.message)
    return fail(c, err.httpStatus, err.code, err.message)
  }

  /* 未捕获的异常，记录完整错误栈 */
  logger.error({ reqId, err }, 'Unhandled error')
  const message =
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  return fail(c, 500, CODE.INTERNAL_ERROR, message)
})

/** 404 兜底 */
app.notFound((c) => {
  return fail(c, 404, CODE.NOT_FOUND, `Route not found: ${c.req.method} ${c.req.path}`)
})
