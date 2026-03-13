import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useConnectionStore } from "@/stores/connection"
import { QUERY_KEYS } from "@/lib/constants"

/** SSE 事件名 → 需要刷新的 Query Key 映射 */
const EVENT_INVALIDATION_MAP: Record<string, readonly (readonly string[])[]> = {
  "agent.synced": [QUERY_KEYS.agents, QUERY_KEYS.activities],
  "agent.status": [QUERY_KEYS.agents, QUERY_KEYS.activities],
  "task.created": [QUERY_KEYS.tasks, QUERY_KEYS.activities],
  "task.updated": [QUERY_KEYS.tasks, QUERY_KEYS.activities],
  "task.completed": [QUERY_KEYS.tasks, QUERY_KEYS.activities],
  "session.created": [QUERY_KEYS.sessions, QUERY_KEYS.activities],
}

/**
 * 建立 SSE 连接并自动刷新相关查询缓存
 *
 * 在 App 根组件中调用一次即可。
 * 断线后自动重连（3 秒延迟）。
 */
export function useSSE() {
  const queryClient = useQueryClient()
  const setSseConnected = useConnectionStore((s) => s.setSseConnected)
  /** 重连定时器引用 */
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    let es: EventSource | null = null

    function connect() {
      es = new EventSource("/api/events/stream")

      es.addEventListener("connected", () => {
        setSseConnected(true)
      })

      /* 为每个业务事件注册监听，收到后刷新对应缓存 */
      for (const [event, keys] of Object.entries(EVENT_INVALIDATION_MAP)) {
        es.addEventListener(event, () => {
          for (const key of keys) {
            queryClient.invalidateQueries({ queryKey: key })
          }
        })
      }

      es.onerror = () => {
        setSseConnected(false)
        es?.close()
        /* 3 秒后自动重连 */
        reconnectTimer.current = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      clearTimeout(reconnectTimer.current)
      es?.close()
      setSseConnected(false)
    }
  }, [queryClient, setSseConnected])
}
