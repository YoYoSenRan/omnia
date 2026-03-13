/**
 * 数据库连接管理
 *
 * 使用 node-postgres (pg) 连接池 + drizzle-orm 查询构建器。
 * 提供连接初始化、健康检查和优雅关闭功能。
 *
 * @module db
 */

import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { DATABASE_URL } from '../utils/env.js'
import { dbLogger } from '../utils/logger.js'
import * as schema from './schema.js'

const { Pool } = pg

/** PostgreSQL 连接池 */
const pool = new Pool({
  connectionString: DATABASE_URL,
  /* 连接池最大连接数 */
  max: 10,
})

/* 监听连接池错误，避免未处理异常导致进程崩溃 */
pool.on('error', (err) => {
  dbLogger.error({ err }, 'Unexpected database pool error')
})

/** Drizzle ORM 实例（携带 schema 类型推断） */
export const db = drizzle(pool, { schema })

/**
 * 检查数据库连接是否可用
 *
 * @returns 连接是否正常
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    return true
  } catch (err) {
    dbLogger.error({ err }, 'Database health check failed')
    return false
  }
}

/**
 * 关闭数据库连接池
 *
 * 在优雅关闭流程中调用，等待所有活跃连接释放。
 */
export async function closeDatabase(): Promise<void> {
  dbLogger.info('Closing database connection pool')
  await pool.end()
  dbLogger.info('Database connection pool closed')
}
