import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import type { OpenClawAdapter } from '../adapter'
import type { OmniaEvent } from '@omnia/types'

export function sseRoutes(adapter: OpenClawAdapter) {
  const app = new Hono()

  app.get('/stream', (c) => {
    return streamSSE(c, async (stream) => {
      // Send initial connection status
      await stream.writeSSE({
        event: 'connection',
        data: JSON.stringify({ status: adapter.getStatus() }),
      })

      const eventHandler = (event: OmniaEvent) => {
        stream.writeSSE({
          event: event.type,
          data: JSON.stringify(event.payload),
        })
      }

      const statusHandler = (status: string) => {
        stream.writeSSE({
          event: 'connection',
          data: JSON.stringify({ status }),
        })
      }

      adapter.on('event', eventHandler)
      adapter.on('connectionChange', statusHandler)

      stream.onAbort(() => {
        adapter.off('event', eventHandler)
        adapter.off('connectionChange', statusHandler)
      })
    })
  })

  return app
}
