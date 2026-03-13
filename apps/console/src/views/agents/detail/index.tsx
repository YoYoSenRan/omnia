import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAgent } from '@/hooks/use-agents'
import { request } from '@/lib/api'
import { AGENT_STATUS_MAP, QUERY_KEYS } from '@/lib/constants'
import type { AuditLog } from '@/types'

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
  const { t } = useTranslation()
  const { color } = AGENT_STATUS_MAP[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-current/20 px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {/* 状态圆点 */}
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {t(`agents.status${status.charAt(0).toUpperCase()}${status.slice(1)}`)}
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
  const { t } = useTranslation()
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {t('agents.auditLogsLoadFailed')}：{error instanceof Error ? error.message : t('common.unknownError')}
      </p>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t('agents.auditLogsEmpty')}</p>
    )
  }

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
            <span className="ml-2 text-xs font-normal text-muted-foreground">{t('agents.auditVia', { source: log.source })}</span>
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
  const { t } = useTranslation()

  // 获取 Agent 详情数据及查询状态
  const { data: agent, isLoading, isError, error } = useAgent(id)

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

  if (isError || !agent) {
    return (
      <div>
        <BackButton onClick={() => navigate('/agents')} />
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <p className="font-medium">{t('common.loadFailed')}</p>
          <p className="mt-1 text-destructive/80">
            {error instanceof Error ? error.message : t('agents.notFound')}
          </p>
        </div>
      </div>
    )
  }

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
          {t('agents.basicInfo')}
        </h2>

        {/* 分割线 + 字段列表 */}
        <div className="divide-y divide-border rounded-lg border border-border bg-card px-4">
          <InfoRow label={t('agents.fieldId')} value={agent.id} />
          <InfoRow label={t('agents.fieldName')} value={agent.name} />
          <InfoRow label={t('agents.fieldEmoji')} value={agent.emoji} />
          <InfoRow label={t('agents.fieldModel')} value={agent.model} />
          <InfoRow label={t('agents.fieldWorkspace')} value={agent.workspace} />
          <InfoRow label={t('agents.fieldSource')} value={t(`agents.source${agent.source.charAt(0).toUpperCase()}${agent.source.slice(1)}`)} />
          <InfoRow label={t('agents.fieldSourceRef')} value={agent.sourceRef} />
          <InfoRow label={t('agents.fieldLastSync')} value={agent.lastSyncAt ? formatDateTime(agent.lastSyncAt) : null} />
          <InfoRow label={t('agents.fieldLastActive')} value={agent.lastActiveAt ? formatDateTime(agent.lastActiveAt) : null} />
          <InfoRow label={t('agents.fieldCreatedAt')} value={formatDateTime(agent.createdAt)} />
          <InfoRow label={t('agents.fieldUpdatedAt')} value={formatDateTime(agent.updatedAt)} />
        </div>
      </section>

      {/* ── Soul 区 ── */}
      <section aria-labelledby="soul-heading">
        <h2 id="soul-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('agents.soul')}
        </h2>

        {agent.soul ? (
          /* Soul 内容只读展示，保留换行和空白 */
          <textarea
            readOnly
            value={agent.soul}
            rows={12}
            aria-label={t('agents.soulAriaLabel')}
            className="w-full resize-none rounded-lg border border-border bg-muted p-4 font-mono text-xs text-foreground focus:outline-none"
          />
        ) : (
          <p className="text-sm text-muted-foreground">{t('agents.noSoul')}</p>
        )}
      </section>

      {/* ── 审计日志区 ── */}
      <section aria-labelledby="logs-heading">
        <h2 id="logs-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('agents.auditLogs')}
        </h2>

        <AuditLogTimeline agentId={id} />
      </section>

    </div>
  )
}

/**
 * 返回按钮
 *
 * 带左箭头图标的文字按钮，用于返回上一级列表页。
 *
 * @param props.onClick - 点击回调
 */
function BackButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* 左箭头字符 */}
      <span aria-hidden="true">←</span>
      {t('agents.backToList')}
    </button>
  )
}
