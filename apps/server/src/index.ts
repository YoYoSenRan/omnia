import { serve } from '@hono/node-server'
import { createApp } from './app'
import { OpenClawAdapter } from './adapter'
import { env } from './env'

async function main() {
  const adapter = new OpenClawAdapter({
    gatewayUrl: env.GATEWAY_URL,
    token: env.GATEWAY_TOKEN,
  })

  // Try to connect, but don't block startup if Gateway is unavailable
  try {
    await adapter.connect()
  } catch (err) {
    console.warn('Failed to connect to Gateway on startup, will retry in background:', (err as Error).message)
  }

  const app = createApp(adapter)

  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`Omnia server running on http://localhost:${info.port}`)
  })
}

main().catch(console.error)
