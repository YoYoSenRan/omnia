import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { eq } from 'drizzle-orm'
import { connections } from './schema'
import type { ConnectionProfile } from '@omnia/types'

const DB_DIR = join(process.env.HOME ?? '.', '.omnia')
const DB_PATH = join(DB_DIR, 'omnia.db')

mkdirSync(DB_DIR, { recursive: true })

const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite)

// Auto-create table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gateway_url TEXT NOT NULL,
    token TEXT,
    is_active INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`)

// CRUD helpers

function rowToProfile(row: typeof connections.$inferSelect): ConnectionProfile {
  return {
    id: row.id,
    name: row.name,
    gatewayUrl: row.gatewayUrl,
    token: row.token ?? undefined,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function getAllConnections(): ConnectionProfile[] {
  return db.select().from(connections).all().map(rowToProfile)
}

export function getConnection(id: string): ConnectionProfile | undefined {
  const row = db.select().from(connections).where(eq(connections.id, id)).get()
  return row ? rowToProfile(row) : undefined
}

export function createConnection(profile: ConnectionProfile): void {
  db.insert(connections).values({
    id: profile.id,
    name: profile.name,
    gatewayUrl: profile.gatewayUrl,
    token: profile.token ?? null,
    isActive: profile.isActive,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  }).run()
}

export function updateConnection(id: string, data: Partial<Pick<ConnectionProfile, 'name' | 'gatewayUrl' | 'token' | 'isActive'>>): void {
  const values: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  if (data.name !== undefined) values.name = data.name
  if (data.gatewayUrl !== undefined) values.gatewayUrl = data.gatewayUrl
  if (data.token !== undefined) values.token = data.token
  if (data.isActive !== undefined) values.isActive = data.isActive

  db.update(connections).set(values).where(eq(connections.id, id)).run()
}

export function deleteConnection(id: string): void {
  db.delete(connections).where(eq(connections.id, id)).run()
}

export function deactivateAll(): void {
  db.update(connections).set({ isActive: false, updatedAt: new Date().toISOString() }).run()
}
