/**
 * 数据库连接管理
 *
 * server 服务连接 omnia_app 数据库。
 *
 * @module db
 */

import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { DATABASE_URL } from '../lib/env.js'
import { logger } from '../lib/logger.js'
import * as schema from './schema.js'

const { Pool } = pg

/** PostgreSQL 连接池 */
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
})

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected database pool error')
})

/** Drizzle ORM 实例 */
export const db = drizzle(pool, { schema })

/**
 * 检查数据库连接
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    return true
  } catch (err) {
    logger.error({ err }, 'Database health check failed')
    return false
  }
}

/**
 * 关闭数据库连接池
 */
export async function closeDatabase(): Promise<void> {
  logger.info('Closing database connection pool')
  await pool.end()
  logger.info('Database connection pool closed')
}
