import type { GatewayEvent, OmniaEvent } from '@omnia/types'

/**
 * Normalize a Gateway event into an Omnia event.
 * Skips internal protocol events (connect.challenge, etc.)
 */
export function normalizeEvent(raw: GatewayEvent): OmniaEvent {
  return {
    type: raw.event,
    payload: raw.payload,
    timestamp: new Date().toISOString(),
    seq: raw.seq,
  }
}

/** Events that are internal to the protocol and should not be forwarded */
const INTERNAL_EVENTS = new Set([
  'connect.challenge',
])

export function isInternalEvent(event: string): boolean {
  return INTERNAL_EVENTS.has(event)
}
