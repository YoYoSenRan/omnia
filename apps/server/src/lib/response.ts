import type { Context } from 'hono'

export function ok<T>(c: Context, data: T, status?: number) {
  return c.json({ ok: true, code: 0, msg: 'success', data }, status as any)
}

export function fail(c: Context, status: number, code: string, msg: string) {
  return c.json({ ok: false, code, msg, data: null }, status as any)
}
