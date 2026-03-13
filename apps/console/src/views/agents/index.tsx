import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAgents } from "@/hooks/use-agents"
import { AGENT_STATUS_MAP } from "@/lib/constants"
import type { Agent } from "@/types"

/**
 * Agent 状态标签
 *
 * 根据状态值渲染对应颜色的小圆点和文字标签。
 *
 * @param props.status - Agent 状态值
 */
function StatusBadge({ status }: { status: Agent["status"] }) {
  const { t } = useTranslation()
  // 从常量表中取出当前状态的显示信息
  const { color } = AGENT_STATUS_MAP[status]

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      {/* 状态指示圆点 */}
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {t(`agents.status${status.charAt(0).toUpperCase()}${status.slice(1)}`)}
    </span>
  )
}

/**
 * Agent 来源标签
 *
 * 渲染 Agent 数据来源的灰色标签（gateway / local / config）。
 *
 * @param props.source - Agent 来源类型
 */
function SourceBadge({ source }: { source: Agent["source"] }) {
  const { t } = useTranslation()
  // 从常量表中取出来源的显示文案
  const SOURCE_KEY_MAP: Record<Agent["source"], string> = {
    gateway: "agents.sourceGateway",
    local: "agents.sourceLocal",
    config: "agents.sourceConfig",
  }

  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      {t(SOURCE_KEY_MAP[source])}
    </span>
  )
}

/**
 * Agent 卡片
 *
 * 展示单个 Agent 的概要信息，整体可点击跳转详情页。
 *
 * @param props.agent   - Agent 数据对象
 * @param props.onClick - 点击回调
 */
function AgentCard({ agent, onClick }: { agent: Agent; onClick: () => void }) {
  const { t } = useTranslation()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Agent emoji 头像区域 */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xl">{agent.emoji ?? "🤖"}</div>

      {/* Agent 主信息 */}
      <div className="min-w-0 flex-1">
        {/* 名称行 */}
        <p className="truncate text-sm font-semibold text-foreground">{agent.name}</p>

        {/* 模型信息，无值时显示占位文字 */}
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{agent.model ?? t("agents.noModel")}</p>
      </div>

      {/* 右侧标签区 */}
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={agent.status} />
        <SourceBadge source={agent.source} />
      </div>
    </div>
  )
}

/**
 * Agent 列表页
 *
 * 顶部展示标题和新建按钮，主体区域以卡片列表展示所有 Agent。
 * 数据通过 useAgents() Hook 获取，自动处理加载/错误/空状态。
 */
export function AgentsView() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // 获取 Agent 列表数据及查询状态
  const { data: agents, isLoading, isError, error } = useAgents()

  if (isLoading) {
    return (
      <div>
        <PageHeader />
        <div className="mt-6 space-y-3">
          {/* 骨架屏：渲染 4 个占位条 */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <PageHeader />
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <p className="font-medium">{t("common.loadFailed")}</p>
          <p className="mt-1 text-destructive/80">{error instanceof Error ? error.message : t("common.unknownError")}</p>
        </div>
      </div>
    )
  }

  if (!agents || agents.length === 0) {
    return (
      <div>
        <PageHeader />
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <span className="text-4xl" aria-hidden="true">
            🤖
          </span>
          <p className="text-sm font-medium text-foreground">{t("agents.empty")}</p>
          <p className="text-xs text-muted-foreground">{t("agents.emptyHint")}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader />

      {/* Agent 卡片列表 */}
      <div className="mt-6 space-y-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onClick={() => navigate(`/agents/${agent.id}`)} />
        ))}
      </div>
    </div>
  )
}

/**
 * 页面顶部标题区
 *
 * 包含页面标题、描述文字和新建按钮，抽取为独立组件避免在各状态分支重复。
 */
function PageHeader() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="flex items-start justify-between">
      {/* 标题 + 描述 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("agents.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("agents.subtitle")}</p>
      </div>

      {/* 新建按钮：暂时跳转到占位路由，后续接表单弹窗 */}
      <button
        type="button"
        onClick={() => navigate("/agents/new")}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span aria-hidden="true">+</span>
        {t("agents.create")}
      </button>
    </div>
  )
}
