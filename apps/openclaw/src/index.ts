/**
 * 服务入口
 *
 * 启动 HTTP 服务器，初始化数据库连接，注册进程级错误处理和优雅关闭。
 *
 * @module index
 */

import { serve } from '@hono/node-server'
import { app } from './app.js'
import { PORT } from './lib/env.js'
import { logger } from './lib/logger.js'
import { checkConnection, closeDatabase } from './db/index.js'

/**
 * 启动服务
 *
 * 流程：
 * 1. 检查数据库连接
 * 2. 启动 HTTP 服务器
 * 3. 注册进程级错误处理
 * 4. 注册优雅关闭钩子
 */
async function bootstrap(): Promise<void> {
  /* 1. 验证数据库连接 */
  const dbReady = await checkConnection()
  if (!dbReady) {
    logger.fatal('Failed to connect to database, aborting startup')
    process.exit(1)
  }
  logger.info('Database connection established')

  /* 2. 启动 HTTP 服务器 */
  const server = serve({
    fetch: app.fetch,
    port: PORT,
  })

  logger.info({ port: PORT }, 'Omnia openclaw service started')

  /* 3. 优雅关闭 */
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received, starting graceful shutdown')

    /* 停止接受新连接 */
    server.close(() => {
      logger.info('HTTP server closed')
    })

    /* 关闭数据库连接池 */
    await closeDatabase()

    logger.info('Graceful shutdown completed')
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

// ── 进程级错误处理 ────────────────────────────────────────

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled rejection')
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception')
  process.exit(1)
})

/* 启动服务 */
bootstrap().catch((err) => {
  logger.fatal({ err }, 'Bootstrap failed')
  process.exit(1)
})
