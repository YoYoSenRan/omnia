import { useEffect, useRef } from 'react'
import { API_BASE } from '@/lib/constants'
import { useConnectionStore } from '@/stores/connection-store'
import type { ConnectionStatus } from '@omnia/types'

export function useSSE() {
  const sourceRef = useRef<EventSource | null>(null)
  const closedRef = useRef(false)

  useEffect(() => {
    closedRef.current = false
    const es = new EventSource(`${API_BASE}/api/events/stream`)
    sourceRef.current = es

    es.addEventListener('connection', (e) => {
      const data = JSON.parse(e.data) as { status: ConnectionStatus }
      useConnectionStore.getState().setStatus(data.status)
    })

    es.addEventListener('status', (e) => {
      const data = JSON.parse(e.data) as { gateway: ConnectionStatus; uptime: number }
      useConnectionStore.getState().setStatus(data.gateway)
      useConnectionStore.getState().setUptime(data.uptime)
    })

    es.addEventListener('gateway', (e) => {
      const data = JSON.parse(e.data)
      console.debug('[SSE] gateway event:', data)
    })

    es.onerror = () => {
      // EventSource auto-reconnects; only mark disconnected when it truly gives up
      if (!closedRef.current && es.readyState === EventSource.CLOSED) {
        useConnectionStore.getState().setStatus('disconnected')
      }
    }

    return () => {
      closedRef.current = true
      es.close()
      sourceRef.current = null
    }
  }, [])
}
