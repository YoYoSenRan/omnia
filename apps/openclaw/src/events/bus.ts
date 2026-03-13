/**
 * 事件总线
 *
 * 基于 Node.js EventEmitter 的进程内事件系统。
 * 所有模块通过事件总线发布事件，SSE 模块订阅并推送给客户端。
 *
 * 事件命名规则：{模块}.{动作}（如 agent.synced、task.created）
 *
 * @module events/bus
 */

import { EventEmitter } from "node:events"
import { eventLogger } from "../utils/logger.js"

/** 事件负载基础类型 */
export interface EventPayload {
  /** 事件发生时间戳（ISO 8601） */
  timestamp: string
  /** 附加数据 */
  [key: string]: unknown
}

/** 全局事件总线实例 */
export const eventBus = new EventEmitter()

/* 提高监听器上限，避免大量 SSE 连接时警告 */
eventBus.setMaxListeners(100)

/**
 * 发布事件到总线
 *
 * @param event - 事件名称（如 'agent.synced'、'task.created'）
 * @param payload - 事件负载数据
 *
 * @example
 * ```ts
 * emitEvent('agent.synced', { agentId: 'a-001', source: 'gateway' })
 * ```
 */
export function emitEvent(event: string, payload: Record<string, unknown>): void {
  const data: EventPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  }
  eventLogger.debug({ event, payload: data }, "Event emitted")
  eventBus.emit(event, data)
}
