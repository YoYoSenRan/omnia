import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { eq } from 'drizzle-orm'
import { connections, projects } from './schema'
import type { ConnectionProfile, Project } from '@omnia/types'

const DB_DIR = join(process.env.HOME ?? '.', '.omnia')
const DB_PATH = join(DB_DIR, 'omnia.db')

mkdirSync(DB_DIR, { recursive: true })

const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite)

// Auto-create tables
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

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gateway_url TEXT NOT NULL,
    token TEXT,
    is_last_active INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`)

// Migration: connections → projects (one-time)
{
  const projectCount = sqlite.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }
  const connectionCount = sqlite.prepare('SELECT COUNT(*) as count FROM connections').get() as { count: number }
  if (projectCount.count === 0 && connectionCount.count > 0) {
    console.log('[db] Migrating connections → projects...')
    const rows = sqlite.prepare('SELECT * FROM connections').all() as Array<{
      id: string; name: string; gateway_url: string; token: string | null
      is_active: number; created_at: string; updated_at: string
    }>
    const insertStmt = sqlite.prepare(
      'INSERT INTO projects (id, name, gateway_url, token, is_last_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    for (const row of rows) {
      insertStmt.run(row.id, row.name, row.gateway_url, row.token, row.is_active, row.created_at, row.updated_at)
    }
    console.log(`[db] Migrated ${rows.length} connection(s) to projects`)
  }
}

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

// ─── Projects CRUD ───

function rowToProject(row: typeof projects.$inferSelect): Project {
  return {
    id: row.id,
    name: row.name,
    gatewayUrl: row.gatewayUrl,
    token: row.token ?? undefined,
    isLastActive: row.isLastActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function getAllProjects(): Project[] {
  return db.select().from(projects).all().map(rowToProject)
}

export function getProject(id: string): Project | undefined {
  const row = db.select().from(projects).where(eq(projects.id, id)).get()
  return row ? rowToProject(row) : undefined
}

export function createProject(project: Project): void {
  db.insert(projects).values({
    id: project.id,
    name: project.name,
    gatewayUrl: project.gatewayUrl,
    token: project.token ?? null,
    isLastActive: project.isLastActive,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }).run()
}

export function updateProject(id: string, data: Partial<Pick<Project, 'name' | 'gatewayUrl' | 'token' | 'isLastActive'>>): void {
  const values: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  if (data.name !== undefined) values.name = data.name
  if (data.gatewayUrl !== undefined) values.gatewayUrl = data.gatewayUrl
  if (data.token !== undefined) values.token = data.token
  if (data.isLastActive !== undefined) values.isLastActive = data.isLastActive

  db.update(projects).set(values).where(eq(projects.id, id)).run()
}

export function deleteProject(id: string): void {
  db.delete(projects).where(eq(projects.id, id)).run()
}

export function deactivateAllProjects(): void {
  db.update(projects).set({ isLastActive: false, updatedAt: new Date().toISOString() }).run()
}

export function getLastActiveProject(): Project | undefined {
  const row = db.select().from(projects).where(eq(projects.isLastActive, true)).get()
  return row ? rowToProject(row) : undefined
}
