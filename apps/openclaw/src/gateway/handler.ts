/**
 * 网关事件处理器
 *
 * 将网关事件分发到对应的 service 调用。
 *
 * @module gateway/handler
 */

import type { GatewayFrame } from "./protocol.js"
import { agentService } from "../services/agent.js"
import { emitEvent } from "../events/bus.js"
import { gwLogger } from "../utils/logger.js"

/**
 * 处理网关事件帧
 */
export function handleGatewayFrame(frame: GatewayFrame): void {
  if (frame.type !== "event" || !frame.event) return

  const payload = frame.payload as Record<string, unknown> | undefined

  switch (frame.event) {
    case "tick":
      // 心跳 tick，可用于更新 session 快照
      gwLogger.debug({ seq: frame.seq }, "Gateway tick")
      break

    case "agent.status": {
      const agentId = payload?.agentId as string | undefined
      const status = payload?.status as string | undefined
      if (agentId && status) {
        agentService.updateStatus(agentId, status).catch((err) => {
          gwLogger.warn({ err, agentId, status }, "Failed to update agent status from gateway")
        })
        emitEvent("agent.status", { agentId, status, source: "gateway" })
      }
      break
    }

    case "task.created":
    case "task.updated":
      emitEvent(frame.event, { ...payload, source: "gateway" })
      break

    case "session.created":
    case "session.message":
      emitEvent(frame.event, { ...payload, source: "gateway" })
      break

    case "log":
      gwLogger.info({ payload }, "Gateway log")
      break

    default:
      gwLogger.debug({ event: frame.event }, "Unknown gateway event")
  }
}
