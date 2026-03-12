import { Hono } from 'hono'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { env } from '../env'
import { ok, fail } from '../lib/response'

const WORKSPACE_FILES = [
  'AGENTS.md',
  'SOUL.md',
  'USER.md',
  'IDENTITY.md',
  'TOOLS.md',
  'MEMORY.md',
] as const

export function workspaceRoutes() {
  const app = new Hono()

  app.get('/files', async (c) => {
    const results: Record<string, string | null> = {}
    for (const file of WORKSPACE_FILES) {
      try {
        const content = await readFile(join(env.WORKSPACE_PATH, file), 'utf-8')
        results[file] = content
      } catch {
        results[file] = null
      }
    }
    return ok(c, results)
  })

  app.get('/files/:name', async (c) => {
    const name = c.req.param('name')
    if (!WORKSPACE_FILES.includes(name as typeof WORKSPACE_FILES[number])) {
      return fail(c, 400, 'INVALID_REQUEST', 'Invalid workspace file')
    }
    try {
      const content = await readFile(join(env.WORKSPACE_PATH, name), 'utf-8')
      return ok(c, { name, content })
    } catch {
      return fail(c, 404, 'NOT_FOUND', 'File not found')
    }
  })

  return app
}
