/**
 * Agent 详情页
 *
 * 展示单个 Agent 的完整信息，包括基本属性、Soul 配置和审计日志时间线。
 * 通过 URL 参数 `:id` 获取目标 Agent。
 *
 * @module views/agents/detail
 */

import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAgent } from '@/hooks/use-agents'
import { request } from '@/lib/api'
import { AGENT_STATUS_MAP, AGENT_SOURCE_MAP, QUERY_KEYS } from '@/lib/constants'
import type { AuditLog } from '@/types'

// ── 工具函数 ──────────────────────────────────────────────────────────────────

/**
 * 将 ISO 时间字符串格式化为易读的本地时间
 *
 * @param iso - ISO 8601 格式的时间字符串
 * @returns 格式化后的本地日期时间字符串，解析失败返回原始字符串
 */
function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    // 解析失败时原样返回，避免抛出
    return iso
  }
}

// ── 子组件 ────────────────────────────────────────────────────────────────────

/**
 * 信息行
 *
 * 用于基本信息区域的 label + value 排版。
 * value 为 null/undefined 时显示灰色占位符 "—"。
 *
 * @param props.label - 字段名称
 * @param props.value - 字段值，null 显示占位符
 */
function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-3 py-2.5 text-sm">
      {/* 左侧标签，固定宽度保证对齐 */}
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      {/* 右侧值，null 时显示占位符 */}
      <span className="text-foreground">{value ?? <span className="text-muted-foreground">—</span>}</span>
    </div>
  )
}

/**
 * Agent 状态标签
 *
 * 用于顶部标题行，带圆点的彩色状态指示。
 *
 * @param props.status - Agent 状态值
 */
function StatusBadge({ status }: { status: keyof typeof AGENT_STATUS_MAP }) {
  const { label, color } = AGENT_STATUS_MAP[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-current/20 px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {/* 状态圆点 */}
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  )
}

/**
 * 审计日志时间线
 *
 * 以竖向时间线形式展示审计日志列表。
 * 处理加载中、错误和空列表三种状态。
 *
 * @param props.agentId - 目标 Agent ID，用于构造请求 URL
 */
function AuditLogTimeline({ agentId }: { agentId: string }) {
  // 查询该 Agent 的审计日志
  const {
    data: logs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.agentLogs(agentId),
    queryFn: () => request<AuditLog[]>(`/api/agents/${agentId}/logs`),
    enabled: !!agentId,
  })

  // ── 加载中 ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    )
  }

  // ── 错误状态 ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <p className="text-sm text-destructive">
        加载日志失败：{error instanceof Error ? error.message : '未知错误'}
      </p>
    )
  }

  // ── 空列表 ──────────────────────────────────────────────────────────────
  if (!logs || logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">暂无审计日志记录。</p>
    )
  }

  // ── 时间线列表 ──────────────────────────────────────────────────────────
  return (
    <ol className="relative border-l border-border">
      {logs.map((log) => (
        <li key={log.id} className="mb-6 ml-4">
          {/* 时间线圆点 */}
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-background bg-muted-foreground" />

          {/* 时间戳 */}
          <time className="block text-xs text-muted-foreground">
            {formatDateTime(log.createdAt)}
          </time>

          {/* 操作动作 */}
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {log.action}
            {/* 来源标注 */}
            <span className="ml-2 text-xs font-normal text-muted-foreground">via {log.source}</span>
          </p>

          {/* 详情，可能为 null */}
          {log.detail && (
            <p className="mt-1 text-xs text-muted-foreground">{log.detail}</p>
          )}
        </li>
      ))}
    </ol>
  )
}

// ── 主页面组件 ────────────────────────────────────────────────────────────────

/**
 * Agent 详情页
 *
 * 通过 URL 参数 `:id` 加载并展示单个 Agent 的完整信息：
 * - 顶部：返回按钮、名称、状态标签
 * - 基本信息区：各字段 InfoRow 列表
 * - Soul 区：只读 textarea 展示 soul 内容
 * - 审计日志区：时间线组件
 */
export function AgentDetailView() {
  const { id = '' } = useParams<{ id: string }>() // 从路由参数取 Agent ID
  const navigate = useNavigate()

  // 获取 Agent 详情数据及查询状态
  const { data: agent, isLoading, isError, error } = useAgent(id)

  // ── 加载中状态 ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* 顶部骨架 */}
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        {/* 内容区骨架 */}
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  // ── 错误状态 ──────────────────────────────────────────────────────────────
  if (isError || !agent) {
    return (
      <div>
        <BackButton onClick={() => navigate('/agents')} />
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <p className="font-medium">加载失败</p>
          <p className="mt-1 text-destructive/80">
            {error instanceof Error ? error.message : 'Agent 不存在或无法访问'}
          </p>
        </div>
      </div>
    )
  }

  // ── 正常渲染 ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── 顶部：返回 + 名称 + 状态 ── */}
      <div>
        <BackButton onClick={() => navigate('/agents')} />

        <div className="mt-4 flex items-center gap-3">
          {/* Agent emoji */}
          <span className="text-3xl" aria-hidden="true">{agent.emoji ?? '🤖'}</span>

          {/* Agent 名称 */}
          <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>

          {/* 状态标签 */}
          <StatusBadge status={agent.status} />
        </div>
      </div>

      {/* ── 基本信息区 ── */}
      <section aria-labelledby="info-heading">
        <h2 id="info-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          基本信息
        </h2>

        {/* 分割线 + 字段列表 */}
        <div className="divide-y divide-border rounded-lg border border-border bg-card px-4">
          <InfoRow label="ID" value={agent.id} />
          <InfoRow label="名称" value={agent.name} />
          <InfoRow label="Emoji" value={agent.emoji} />
          <InfoRow label="Model" value={agent.model} />
          <InfoRow label="Workspace" value={agent.workspace} />
          <InfoRow label="来源" value={AGENT_SOURCE_MAP[agent.source].label} />
          <InfoRow label="来源引用" value={agent.sourceRef} />
          <InfoRow label="最近同步" value={agent.lastSyncAt ? formatDateTime(agent.lastSyncAt) : null} />
          <InfoRow label="最近活跃" value={agent.lastActiveAt ? formatDateTime(agent.lastActiveAt) : null} />
          <InfoRow label="创建时间" value={formatDateTime(agent.createdAt)} />
          <InfoRow label="更新时间" value={formatDateTime(agent.updatedAt)} />
        </div>
      </section>

      {/* ── Soul 区 ── */}
      <section aria-labelledby="soul-heading">
        <h2 id="soul-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Soul
        </h2>

        {agent.soul ? (
          /* Soul 内容只读展示，保留换行和空白 */
          <textarea
            readOnly
            value={agent.soul}
            rows={12}
            aria-label="Agent Soul 内容"
            className="w-full resize-none rounded-lg border border-border bg-muted p-4 font-mono text-xs text-foreground focus:outline-none"
          />
        ) : (
          <p className="text-sm text-muted-foreground">该 Agent 未配置 Soul。</p>
        )}
      </section>

      {/* ── 审计日志区 ── */}
      <section aria-labelledby="logs-heading">
        <h2 id="logs-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          审计日志
        </h2>

        <AuditLogTimeline agentId={id} />
      </section>

    </div>
  )
}

// ── 内部工具组件 ──────────────────────────────────────────────────────────────

/**
 * 返回按钮
 *
 * 带左箭头图标的文字按钮，用于返回上一级列表页。
 *
 * @param props.onClick - 点击回调
 */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* 左箭头字符 */}
      <span aria-hidden="true">←</span>
      返回 Agents
    </button>
  )
}
