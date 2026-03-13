/**
 * Hono 应用初始化
 *
 * 路由分组：
 * - /health — 无鉴权，健康检查
 * - /api/*  — API Key 鉴权，供 web 前端使用
 *
 * @module app
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { API_KEY, CORS_ORIGIN } from './lib/env.js'
import { logger } from './lib/logger.js'
import { AppError } from './lib/errors.js'
import { CODE } from './lib/code.js'
import { fail } from './lib/response.js'
import { apiKeyAuth } from './lib/auth.js'
import { healthRoutes } from './routes/health.js'

/** 自定义 Hono 变量类型 */
type AppVariables = {
  reqId: string
}

/** Hono 应用实例 */
export const app = new Hono<{ Variables: AppVariables }>()

// ── 全局中间件 ────────────────────────────────────────────

app.use(
  '*',
  cors({
    origin: CORS_ORIGIN,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
)

app.use('*', honoLogger())

/* 请求 ID + 结构化日志 */
app.use('*', async (c, next) => {
  const reqId = c.req.header('X-Request-Id') ?? crypto.randomUUID()
  c.set('reqId', reqId)
  c.header('X-Request-Id', reqId)

  const start = Date.now()
  await next()
  const duration = Date.now() - start

  logger.info(
    { reqId, method: c.req.method, path: c.req.path, status: c.res.status, duration },
    'Request completed',
  )
})

// ── 公开路由 ──────────────────────────────────────────────

app.route('/', healthRoutes)

// ── API 路由（API Key 鉴权） ─────────────────────────────

app.use('/api/*', apiKeyAuth(API_KEY))

/* 后续按业务需求注册更多路由 */

// ── 全局错误处理 ──────────────────────────────────────────

app.onError((err, c) => {
  const reqId = c.get('reqId') as string | undefined

  if (err instanceof AppError) {
    logger.warn({ reqId, code: err.code, err }, err.message)
    return fail(c, err.httpStatus, err.code, err.message)
  }

  logger.error({ reqId, err }, 'Unhandled error')
  const message =
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  return fail(c, 500, CODE.INTERNAL_ERROR, message)
})

app.notFound((c) => {
  return fail(c, 404, CODE.NOT_FOUND, `Route not found: ${c.req.method} ${c.req.path}`)
})
