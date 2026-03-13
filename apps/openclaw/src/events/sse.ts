/**
 * SSE（Server-Sent Events）推送模块
 *
 * 监听事件总线上的所有业务事件，通过 SSE 推送给已连接的客户端。
 * 每个 SSE 连接会订阅一组预定义的事件类型。
 *
 * @module events/sse
 */

import type { Context } from 'hono'
import { streamSSE } from 'hono/streaming'
import { eventBus } from './bus.js'
import { eventLogger } from '../utils/logger.js'

/** 需要推送给 SSE 客户端的事件列表 */
const SSE_EVENTS = [
  'connection',
  'agent.synced',
  'agent.status',
  'task.created',
  'task.updated',
  'task.completed',
  'session.created',
  'session.message',
] as const

/**
 * SSE 事件流路由处理函数
 *
 * 客户端连接后，订阅事件总线上的所有 SSE_EVENTS，
 * 当事件触发时自动推送给客户端。断开连接时自动清理监听器。
 *
 * @param c - Hono 上下文
 * @returns SSE 流式响应
 *
 * @example
 * ```ts
 * // 路由注册
 * app.get('/api/events/stream', handleSSE)
 *
 * // 客户端订阅
 * const es = new EventSource('/api/events/stream')
 * es.addEventListener('agent.synced', (e) => console.log(JSON.parse(e.data)))
 * ```
 */
export function handleSSE(c: Context) {
  return streamSSE(c, async (stream) => {
    eventLogger.info('SSE client connected')

    /** 事件监听器映射，用于断开时清理 */
    const listeners = new Map<string, (data: unknown) => void>()

    /* 为每个事件类型注册监听器 */
    for (const event of SSE_EVENTS) {
      const listener = (data: unknown) => {
        stream
          .writeSSE({ event, data: JSON.stringify(data) })
          .catch(() => {
            /* 写入失败说明连接已断开，静默忽略 */
          })
      }
      listeners.set(event, listener)
      eventBus.on(event, listener)
    }

    /* 发送初始连接确认事件 */
    await stream.writeSSE({
      event: 'connected',
      data: JSON.stringify({ timestamp: new Date().toISOString() }),
    })

    /* 等待流关闭（客户端断开或服务端主动关闭） */
    stream.onAbort(() => {
      eventLogger.info('SSE client disconnected')
      /* 清理所有事件监听器，防止内存泄漏 */
      for (const [event, listener] of listeners) {
        eventBus.off(event, listener)
      }
      listeners.clear()
    })
  })
}
