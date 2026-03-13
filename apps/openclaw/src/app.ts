/**
 * Hono 应用初始化
 *
 * 中间件 + 路由挂载 + 错误处理，保持薄。
 *
 * @module app
 */

type AppVariables = {
  reqId: string
}

import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger as honoLogger } from "hono/logger"
import { API_KEY, SERVICE_TOKEN, CORS_ORIGIN } from "./utils/env.js"
import { logger } from "./utils/logger.js"
import { ZodError } from "zod"
import { AppError } from "./http/errors.js"
import { CODE } from "./http/code.js"
import { fail } from "./http/response.js"
import { apiKeyAuth, serviceAuth } from "./middleware/auth.js"
import { requestId } from "./middleware/request-id.js"

/* 路由模块 */
import { systemRoutes } from "./routes/system.js"
import { agentRoutes, agentOpenRoutes } from "./routes/agents.js"
import { skillRoutes, skillOpenRoutes } from "./routes/skills.js"
import { taskRoutes, taskOpenRoutes } from "./routes/tasks.js"
import { sessionRoutes, sessionOpenRoutes } from "./routes/sessions.js"
import { handleSSE } from "./events/sse.js"

/** Hono 应用实例 */
export const app = new Hono<{ Variables: AppVariables }>()

// ── 全局中间件 ────────────────────────────────────────────

app.use(
  "*",
  cors({
    origin: CORS_ORIGIN,
    allowHeaders: ["Content-Type", "Authorization", "X-Service-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
)

app.use("*", honoLogger())
app.use("*", requestId)

// ── 公开路由（无鉴权） ───────────────────────────────────

app.route("/", systemRoutes)

// ── 内部路由（API Key 鉴权） ─────────────────────────────

app.use("/api/*", apiKeyAuth(API_KEY))

app.get("/api/events/stream", handleSSE)

app.route("/api/agents", agentRoutes)
app.route("/api/skills", skillRoutes)
app.route("/api/tasks", taskRoutes)
app.route("/api/sessions", sessionRoutes)

// ── 开放路由（Service Token 鉴权） ──────────────────────

app.use("/open/*", serviceAuth(SERVICE_TOKEN))

app.route("/open/agents", agentOpenRoutes)
app.route("/open/skills", skillOpenRoutes)
app.route("/open/tasks", taskOpenRoutes)
app.route("/open/sessions", sessionOpenRoutes)

// ── 全局错误处理 ──────────────────────────────────────────

app.onError((err, c) => {
  const reqId = c.get("reqId") as string | undefined

  if (err instanceof ZodError) {
    const details = err.issues.map((e) => `${e.path.join(".")}: ${e.message}`)
    return fail(c, 400, CODE.BAD_REQUEST, `Validation failed: ${details.join("; ")}`)
  }

  if (err instanceof AppError) {
    logger.warn({ reqId, code: err.code, err }, err.message)
    return fail(c, err.httpStatus, err.code, err.message)
  }

  logger.error({ reqId, err }, "Unhandled error")
  const message = process.env.NODE_ENV === "development" ? err.message : "Internal server error"
  return fail(c, 500, CODE.INTERNAL_ERROR, message)
})

app.notFound((c) => {
  return fail(c, 404, CODE.NOT_FOUND, `Route not found: ${c.req.method} ${c.req.path}`)
})
