/**
 * 服务入口
 *
 * 启动 HTTP 服务器，初始化数据库连接，连接网关，注册优雅关闭。
 *
 * @module index
 */

import { serve } from "@hono/node-server"
import { app } from "./app.js"
import { PORT } from "./utils/env.js"
import { logger } from "./utils/logger.js"
import { checkConnection, closeDatabase } from "./db/index.js"
import { GatewayClient, setGatewayClient } from "./gateway/client.js"
import { handleGatewayFrame } from "./gateway/handler.js"
import { detectGatewayUrl, detectGatewayToken } from "./gateway/config.js"

let gatewayClient: GatewayClient | null = null

async function bootstrap(): Promise<void> {
  /* 1. 验证数据库连接 */
  const dbReady = await checkConnection()
  if (!dbReady) {
    logger.fatal("Failed to connect to database, aborting startup")
    process.exit(1)
  }
  logger.info("Database connection established")

  /* 2. 启动 HTTP 服务器 */
  const server = serve({
    fetch: app.fetch,
    port: PORT,
  })

  logger.info({ port: PORT }, "Omnia openclaw service started")

  /* 3. 连接网关（可选） */
  const gwUrl = detectGatewayUrl()
  if (gwUrl) {
    gatewayClient = new GatewayClient({
      url: gwUrl,
      tokenProvider: detectGatewayToken,
    })
    gatewayClient.onMessage(handleGatewayFrame)
    gatewayClient.connect()
    setGatewayClient(gatewayClient)
    logger.info({ url: gwUrl }, "Gateway client initialized")
  } else {
    logger.info("No gateway URL detected, running in standalone mode")
  }

  /* 4. 优雅关闭 */
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutdown signal received, starting graceful shutdown")

    server.close(() => {
      logger.info("HTTP server closed")
    })

    if (gatewayClient) {
      gatewayClient.disconnect()
    }

    await closeDatabase()

    logger.info("Graceful shutdown completed")
    process.exit(0)
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"))
  process.on("SIGINT", () => shutdown("SIGINT"))
}

// ── 进程级错误处理 ────────────────────────────────────────

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled rejection")
  process.exit(1)
})

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception")
  process.exit(1)
})

bootstrap().catch((err) => {
  logger.fatal({ err }, "Bootstrap failed")
  process.exit(1)
})
