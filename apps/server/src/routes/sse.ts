import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import type { AdapterManager } from '../adapter'
import type { OmniaEvent } from '@omnia/types'

export function sseRoutes(manager: AdapterManager) {
  const app = new Hono()

  app.get('/stream', (c) => {
    return streamSSE(c, async (stream) => {
      const active = manager.getActive()

      // Send initial connection status
      await stream.writeSSE({
        event: 'connection',
        data: JSON.stringify({ status: active?.getStatus() ?? 'disconnected' }),
      })

      const eventHandler = (event: OmniaEvent) => {
        stream.writeSSE({
          event: event.type,
          data: JSON.stringify(event.payload),
        })
      }

      const statusHandler = ({ status }: { connectionId: string; status: string }) => {
        stream.writeSSE({
          event: 'connection',
          data: JSON.stringify({ status }),
        })
      }

      manager.on('event', eventHandler)
      manager.on('connectionChange', statusHandler)

      stream.onAbort(() => {
        manager.off('event', eventHandler)
        manager.off('connectionChange', statusHandler)
      })
    })
  })

  return app
}
