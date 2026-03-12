import { serve } from '@hono/node-server'
import { createApp } from './app'
import { AdapterManager } from './adapter'
import { env } from './env'
import { getLastActiveProject } from './db'

async function main() {
  const manager = new AdapterManager()

  // Auto-connect the last active project (if any)
  const lastActive = getLastActiveProject()
  if (lastActive) {
    try {
      await manager.connect({
        id: lastActive.id,
        name: lastActive.name,
        gatewayUrl: lastActive.gatewayUrl,
        token: lastActive.token,
        isActive: true,
        createdAt: lastActive.createdAt,
        updatedAt: lastActive.updatedAt,
      })
      manager.setActive(lastActive.id)
      console.log(`Auto-connected project "${lastActive.name}"`)
    } catch (err) {
      console.warn(
        `Failed to connect project "${lastActive.name}" on startup:`,
        (err as Error).message
      )
    }
  }

  const app = createApp(manager)

  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`Omnia server running on http://localhost:${info.port}`)
  })
}

main().catch(console.error)
