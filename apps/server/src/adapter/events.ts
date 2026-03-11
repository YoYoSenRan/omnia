import type { GatewayEvent, OmniaEvent } from '@omnia/types'

/**
 * Normalize a Gateway event into an Omnia event.
 */
export function normalizeEvent(raw: GatewayEvent): OmniaEvent {
  return {
    type: raw.event,
    payload: raw.payload,
    timestamp: new Date().toISOString(),
  }
}
