import { useEffect, useRef } from 'react'
import { API_BASE } from '@/lib/constants'
import { useConnectionStore } from '@/stores/connection-store'
import type { ConnectionStatus } from '@omnia/types'

export function useSSE() {
  const sourceRef = useRef<EventSource | null>(null)
  const { setStatus, setUptime } = useConnectionStore()

  useEffect(() => {
    const es = new EventSource(`${API_BASE}/api/events`)
    sourceRef.current = es

    es.addEventListener('connection', (e) => {
      const data = JSON.parse(e.data) as { status: ConnectionStatus }
      setStatus(data.status)
    })

    es.addEventListener('status', (e) => {
      const data = JSON.parse(e.data) as { gateway: ConnectionStatus; uptime: number }
      setStatus(data.gateway)
      setUptime(data.uptime)
    })

    es.addEventListener('gateway', (e) => {
      const data = JSON.parse(e.data)
      console.debug('[SSE] gateway event:', data)
    })

    es.onerror = () => {
      setStatus('disconnected')
    }

    return () => {
      es.close()
      sourceRef.current = null
    }
  }, [setStatus, setUptime])
}
