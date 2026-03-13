/**
 * Service 基类
 *
 * 封装 CRUD 通用逻辑：getById 404 检查、活动日志、日志记录、生命周期钩子。
 * 子类只需实现 toInsert() 和按需覆盖钩子。
 *
 * @module services/base
 */

import type { Logger } from 'pino'
import { activityRepo } from '../db/repo/activity.js'
import { AppError } from '../http/errors.js'
import { CODE } from '../http/code.js'

// ── Repo 契约 ──────────────────────────────────────────

export interface BaseRepo<Row, Insert> {
  findAll(): Promise<Row[]>
  findById(id: string): Promise<Row | undefined>
  create(data: Insert): Promise<Row>
  update(id: string, data: Partial<Insert>): Promise<Row | undefined>
  remove(id: string): Promise<boolean>
}

// ── 抽象基类 ────────────────────────────────────────────

export abstract class BaseService<
  Row,
  Insert,
  CreateInput,
  UpdateInput,
> {
  protected entity: string
  protected notFoundCode: number
  protected repo: BaseRepo<Row, Insert>
  protected logger: Logger

  constructor(ctx: {
    entity: string
    notFoundCode: number
    repo: BaseRepo<Row, Insert>
    logger: Logger
  }) {
    this.entity = ctx.entity
    this.notFoundCode = ctx.notFoundCode
    this.repo = ctx.repo
    this.logger = ctx.logger
  }

  // ── 抽象方法（子类必须实现） ──────────────────────────

  /** 将请求入参转换为数据库 Insert 对象 */
  protected abstract toInsert(data: CreateInput): Insert

  // ── 可覆盖钩子（默认空操作） ──────────────────────────

  protected afterCreate(_row: Row, _data: CreateInput, _source: string): void | Promise<void> {}
  protected afterUpdate(_row: Row, _existing: Row, _data: UpdateInput, _source: string): void | Promise<void> {}
  protected createDetail(_data: CreateInput): Record<string, unknown> { return {} }
  protected updateDetail(data: UpdateInput): Record<string, unknown> { return { fields: Object.keys(data as Record<string, unknown>) } }
  protected removeDetail(_existing: Row): Record<string, unknown> { return {} }

  // ── CRUD 实现 ─────────────────────────────────────────

  async list(): Promise<Row[]> {
    return this.repo.findAll()
  }

  async getById(id: string): Promise<Row> {
    const row = await this.repo.findById(id)
    if (!row) {
      throw new AppError(404, this.notFoundCode, `${this.entity} '${id}' not found`)
    }
    return row
  }

  async create(data: CreateInput, source: string = 'user'): Promise<Row> {
    const insert = this.toInsert(data)
    const row = await this.repo.create(insert)

    const id = (row as Record<string, unknown>).id as string
    await activityRepo.log(this.entity, id, 'created', source, this.createDetail(data))
    this.logger.info({ [`${this.entity}Id`]: id }, `${this.entity} created`)
    await this.afterCreate(row, data, source)

    return row
  }

  async update(id: string, data: UpdateInput, source: string = 'user'): Promise<Row> {
    const existing = await this.getById(id)

    const updated = await this.repo.update(id, data as Partial<Insert>)
    if (!updated) {
      throw new AppError(500, CODE.INTERNAL_ERROR, `Failed to update ${this.entity} '${id}'`)
    }

    await activityRepo.log(this.entity, id, 'updated', source, this.updateDetail(data))
    this.logger.info({ [`${this.entity}Id`]: id }, `${this.entity} updated`)
    await this.afterUpdate(updated, existing, data, source)

    return updated
  }

  async remove(id: string, source: string = 'user'): Promise<void> {
    const existing = await this.getById(id)
    await this.repo.remove(id)

    await activityRepo.log(this.entity, id, 'deleted', source, this.removeDetail(existing))
    this.logger.info({ [`${this.entity}Id`]: id }, `${this.entity} deleted`)
  }
}
