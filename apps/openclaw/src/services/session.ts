/**
 * Session Service
 *
 * @module services/session
 */

import { sessionRepo } from "../db/repo/session.js"
import { agentRepo } from "../db/repo/agent.js"
import { activityRepo } from "../db/repo/activity.js"
import { emitEvent } from "../events/bus.js"
import { AppError } from "../http/errors.js"
import { CODE } from "../http/code.js"
import { generateId } from "../utils/id.js"
import { logger } from "../utils/logger.js"
import { BaseService } from "./base.js"
import type { SessionInsert, SessionRow } from "../db/schema/index.js"
import type { SessionCreateInput } from "../validators/session.js"

class SessionService extends BaseService<SessionRow, SessionInsert, SessionCreateInput, never> {
  constructor() {
    super({
      entity: "session",
      notFoundCode: CODE.SESSION_NOT_FOUND,
      repo: sessionRepo,
      logger: logger.child({ module: "session" }),
    })
  }

  protected toInsert(data: SessionCreateInput): SessionInsert {
    return {
      id: data.id ?? generateId(),
      agentId: data.agentId,
      status: "open",
      metadata: data.metadata ?? null,
      createdAt: new Date(),
    }
  }

  async create(data: SessionCreateInput, source: string = "user"): Promise<SessionRow> {
    // 验证关联的 Agent 存在
    const agent = await agentRepo.findById(data.agentId)
    if (!agent) {
      throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${data.agentId}' not found`)
    }

    return super.create(data, source)
  }

  protected afterCreate(row: SessionRow, data: SessionCreateInput): void {
    emitEvent("session.created", { sessionId: row.id, agentId: data.agentId })
  }

  protected createDetail(data: SessionCreateInput): Record<string, unknown> {
    return { agentId: data.agentId }
  }

  // ── 独有方法 ─────────────────────────────────────────

  async close(id: string): Promise<SessionRow> {
    const existing = await this.getById(id)

    if (existing.status === "closed") {
      throw new AppError(409, CODE.SESSION_CLOSED, `Session '${id}' is already closed`)
    }

    const updated = await sessionRepo.update(id, {
      status: "closed",
      closedAt: new Date(),
    })
    if (!updated) {
      throw new AppError(500, CODE.INTERNAL_ERROR, `Failed to close session '${id}'`)
    }

    await activityRepo.log("session", id, "updated", "user", { status: "closed" })
    this.logger.info({ sessionId: id }, "Session closed")

    return updated
  }
}

export const sessionService = new SessionService()
