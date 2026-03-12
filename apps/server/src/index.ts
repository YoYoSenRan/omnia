import { serve } from '@hono/node-server'
import { randomUUID } from 'node:crypto'
import { createApp } from './app'
import { AdapterManager } from './adapter'
import { env } from './env'
import { getAllConnections, createConnection, updateConnection, deactivateAll } from './db'

async function main() {
  const manager = new AdapterManager()

  let profiles = getAllConnections()

  // Backward compat: if DB is empty, seed from env
  if (profiles.length === 0 && env.GATEWAY_URL) {
    const now = new Date().toISOString()
    const defaultProfile = {
      id: randomUUID(),
      name: 'Default',
      gatewayUrl: env.GATEWAY_URL,
      token: env.GATEWAY_TOKEN,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }
    createConnection(defaultProfile)
    profiles = [defaultProfile]
    console.log('Created default connection from environment variables')
  }

  // Auto-connect all active profiles
  for (const profile of profiles) {
    if (!profile.isActive) continue
    try {
      await manager.connect(profile)
      manager.setActive(profile.id)
    } catch (err) {
      console.warn(
        `Failed to connect "${profile.name}" on startup, will retry via UI:`,
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
