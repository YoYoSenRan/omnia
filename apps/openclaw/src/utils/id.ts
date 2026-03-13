/**
 * ID 生成工具
 *
 * @module lib/id
 */

/**
 * 生成 UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID()
}
