/**
 * Sessions 列表页
 *
 * 展示系统中所有 Session 的列表，支持加载中、空状态和错误状态处理。
 * 每行显示 Session ID（前8位）、所属 Agent ID、状态标签、创建时间和关闭时间。
 *
 * @module views/sessions
 */

import { useQuery } from '@tanstack/react-query'
import { request } from '@/lib/api'
import { QUERY_KEYS } from '@/lib/constants'
import type { Session, SessionStatus } from '@/types'

// ── 工具函数 ───────────────────────────────────────────────

/**
 * 格式化 ISO 时间字符串为本地可读格式
 *
 * @param iso - ISO 8601 格式的时间字符串，或 null
 * @returns 格式化后的本地时间字符串，null 时返回 "—"
 */
function formatDate(iso: string | null): string {
  if (!iso) return '—' // 未关闭的 Session closedAt 为 null
  return new Date(iso).toLocaleString()
}

/**
 * 截断 ID，只显示前8位
 *
 * @param id - 完整 UUID 字符串
 * @returns 前8位字符
 */
function truncateId(id: string): string {
  return id.slice(0, 8)
}

// ── 子组件 ─────────────────────────────────────────────────

/**
 * SessionStatusBadge 组件 Props
 */
interface SessionStatusBadgeProps {
  /** Session 状态值 */
  status: SessionStatus
}

/**
 * Session 状态标签组件
 *
 * 用彩色圆点 + 文字展示 Session 当前状态。
 * open = 绿色，closed = 灰色。
 *
 * @param props - 组件属性
 */
function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  /** open 状态用绿色，closed 状态用灰色 */
  const dotClass =
    status === 'open'
      ? 'bg-green-500' // 活跃会话
      : 'bg-gray-400'  // 已关闭会话

  /** 状态文字颜色与圆点保持一致 */
  const textClass =
    status === 'open'
      ? 'text-green-600 dark:text-green-400'
      : 'text-muted-foreground'

  return (
    <span className="inline-flex items-center gap-1.5">
      {/* 状态指示圆点 */}
      <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
      {/* 状态文字 */}
      <span className={`text-xs font-medium capitalize ${textClass}`}>{status}</span>
    </span>
  )
}

/**
 * SessionRow 组件 Props
 */
interface SessionRowProps {
  /** 要渲染的 Session 数据 */
  session: Session
}

/**
 * Session 列表行组件
 *
 * 以 div + border-b 模拟表格行，展示单条 Session 的核心字段。
 *
 * @param props - 组件属性
 */
function SessionRow({ session }: SessionRowProps) {
  return (
    <div className="grid grid-cols-[1fr_1fr_100px_1fr_1fr] items-center gap-4 border-b border-border px-4 py-3 text-sm hover:bg-muted/40 transition-colors">
      {/* Session ID — 截断至前8位，使用等宽字体便于对齐 */}
      <span className="font-mono text-foreground" title={session.id}>
        {truncateId(session.id)}
      </span>

      {/* Agent ID — 截断至前8位 */}
      <span className="font-mono text-muted-foreground" title={session.agentId}>
        {truncateId(session.agentId)}
      </span>

      {/* 状态标签 */}
      <SessionStatusBadge status={session.status} />

      {/* 创建时间 */}
      <span className="text-muted-foreground">{formatDate(session.createdAt)}</span>

      {/* 关闭时间，未关闭时显示破折号 */}
      <span className="text-muted-foreground">{formatDate(session.closedAt)}</span>
    </div>
  )
}

/**
 * 列表表头组件
 *
 * 与 SessionRow 使用相同的 grid 布局，保持列对齐。
 */
function SessionListHeader() {
  return (
    <div className="grid grid-cols-[1fr_1fr_100px_1fr_1fr] items-center gap-4 border-b border-border bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      <span>Session ID</span>
      <span>Agent ID</span>
      <span>Status</span>
      <span>Created At</span>
      <span>Closed At</span>
    </div>
  )
}

// ── 主视图 ─────────────────────────────────────────────────

/**
 * Sessions 列表页主组件
 *
 * 通过 TanStack Query 从 `/api/sessions` 获取数据，
 * 并根据请求状态分别渲染加载中、错误、空状态和正常列表。
 */
export function Sessions() {
  /**
   * 发起 Sessions 列表查询
   * queryKey 来自常量，保持缓存 key 一致性
   */
  const {
    data: sessions,   // 成功时的 Session 数组
    isLoading,        // 首次加载中（无缓存数据）
    isError,          // 请求失败
    error,            // 错误对象
  } = useQuery({
    queryKey: QUERY_KEYS.sessions,
    queryFn: () => request<Session[]>('/api/sessions'),
  })

  return (
    <div className="space-y-6">
      {/* 页面标题区域 */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sessions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          查看所有 Agent 会话记录，包括当前活跃和已关闭的会话。
        </p>
      </div>

      {/* 列表容器 */}
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        {/* ── 加载中状态 ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            <span>Loading sessions...</span>
          </div>
        )}

        {/* ── 错误状态 ── */}
        {isError && (
          <div className="flex flex-col items-center justify-center gap-1 py-16">
            <p className="text-sm font-medium text-destructive">Failed to load sessions</p>
            {/* 展示具体错误信息，帮助排查问题 */}
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {/* ── 数据已加载 ── */}
        {!isLoading && !isError && (
          <>
            {/* 表头始终渲染（空状态下也保留结构感） */}
            <SessionListHeader />

            {/* ── 空状态 ── */}
            {sessions && sessions.length === 0 && (
              <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                No sessions found.
              </div>
            )}

            {/* ── 正常列表 ── */}
            {sessions && sessions.length > 0 && (
              <div>
                {sessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
