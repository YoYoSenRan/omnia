/**
 * Agent Service
 *
 * @module services/agent
 */

import { agentRepo } from "../db/repo/agent.js"
import { activityRepo } from "../db/repo/activity.js"
import { emitEvent } from "../events/bus.js"
import { AppError } from "../http/errors.js"
import { CODE } from "../http/code.js"
import { generateId } from "../utils/id.js"
import { logger } from "../utils/logger.js"
import { BaseService } from "./base.js"
import type { AgentInsert, AgentRow } from "../db/schema/index.js"
import type { AgentCreateInput, AgentUpdateInput } from "../validators/agent.js"

class AgentService extends BaseService<AgentRow, AgentInsert, AgentCreateInput, AgentUpdateInput> {
  constructor() {
    super({
      entity: "agent",
      notFoundCode: CODE.AGENT_NOT_FOUND,
      repo: agentRepo,
      logger: logger.child({ module: "agent" }),
    })
  }

  protected toInsert(data: AgentCreateInput): AgentInsert {
    const now = new Date()
    return {
      id: data.id ?? generateId(),
      name: data.name,
      emoji: data.emoji ?? null,
      role: data.role ?? "agent",
      model: data.model ?? null,
      workspace: data.workspace ?? null,
      status: "offline",
      source: data.source ?? "local",
      sourceRef: data.sourceRef ?? null,
      soul: data.soul ?? null,
      config: data.config ?? null,
      createdAt: now,
      updatedAt: now,
    }
  }

  protected afterCreate(row: AgentRow): void {
    emitEvent("agent.status", { agentId: row.id, status: "offline" })
  }

  protected afterUpdate(row: AgentRow, existing: AgentRow, data: AgentUpdateInput): void {
    if (data.status && data.status !== existing.status) {
      emitEvent("agent.status", { agentId: row.id, status: data.status })
    }
  }

  protected createDetail(data: AgentCreateInput): Record<string, unknown> {
    return { name: data.name, source: data.source ?? "local" }
  }

  protected removeDetail(existing: AgentRow): Record<string, unknown> {
    return { name: existing.name }
  }

  // ── 独有方法 ─────────────────────────────────────────

  async updateStatus(id: string, status: string): Promise<AgentRow> {
    const agent = await agentRepo.update(id, { status, lastActiveAt: new Date() })
    if (!agent) {
      throw new AppError(404, CODE.AGENT_NOT_FOUND, `Agent '${id}' not found`)
    }

    await activityRepo.log("agent", id, "status_changed", "system", { status })
    emitEvent("agent.status", { agentId: id, status })

    return agent
  }

  async getSoul(id: string): Promise<string> {
    const agent = await this.getById(id)
    return agent.soul ?? ""
  }

  async updateSoul(id: string, content: string): Promise<void> {
    await this.getById(id)
    await agentRepo.update(id, { soul: content })

    await activityRepo.log("agent", id, "updated", "user", { field: "soul" })
    this.logger.info({ agentId: id }, "Agent soul updated")
  }
}

export const agentService = new AgentService()
