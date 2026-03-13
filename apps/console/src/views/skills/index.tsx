import { useQuery } from "@tanstack/react-query"
import { AlertCircle, Inbox, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { request } from "@/lib/api"
import { QUERY_KEYS } from "@/lib/constants"
import type { Skill } from "@/types"

/**
 * 将 ISO 日期字符串格式化为本地可读时间
 *
 * @param iso - ISO 8601 格式的日期字符串
 * @returns 格式化后的本地日期时间字符串
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * 列表行组件
 *
 * 渲染单条 Skill 记录，包含名称、描述（截断）、来源标签和更新时间。
 *
 * @param props.skill - Skill 数据对象
 */
function SkillRow({ skill }: { skill: Skill }) {
  const { t } = useTranslation()
  const sourceKeyMap: Record<string, string> = {
    local: "skills.sourceLocal",
    config: "skills.sourceConfig",
    gateway: "skills.sourceGateway",
    user: "skills.sourceUser",
    system: "skills.sourceSystem",
  }

  const sourceLabel = sourceKeyMap[skill.source] ? t(sourceKeyMap[skill.source]) : skill.source

  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/40 transition-colors">
      {/* 名称 + 描述 — flex-1 占满剩余宽度 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{skill.name}</p>
        {/* description 可为 null，为空时渲染占位符避免行高塌陷 */}
        <p className="mt-0.5 text-xs text-muted-foreground truncate">
          {skill.description ?? <span className="italic opacity-60">{t("skills.noDescription")}</span>}
        </p>
      </div>

      {/* 来源标签 — 固定宽度防止压缩 */}
      <span className="shrink-0 inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">
        {sourceLabel}
      </span>

      {/* 更新时间 — 右对齐，小屏可隐藏 */}
      <span className="shrink-0 hidden sm:block text-xs text-muted-foreground tabular-nums">{formatDate(skill.updatedAt)}</span>
    </div>
  )
}

/**
 * 加载中状态
 *
 * 居中展示旋转图标，避免页面布局跳动。
 */
function LoadingState() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">{t("common.loading")}</span>
    </div>
  )
}

/**
 * 错误状态
 *
 * @param props.message - 错误描述文本
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-16 gap-2 text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  )
}

/**
 * 空状态
 *
 * 当 Skill 列表为空时展示引导提示。
 */
function EmptyState() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
      <Inbox className="h-8 w-8 opacity-40" />
      <p className="text-sm">{t("skills.empty")}</p>
    </div>
  )
}

/**
 * Skills 列表页
 *
 * 通过 TanStack Query 拉取 `/api/skills`，按行渲染每条 Skill 数据。
 * 根据请求状态自动切换加载中 / 错误 / 空状态三种视图。
 */
export function Skills() {
  const { t } = useTranslation()
  /** 拉取 Skill 列表，缓存 key 使用 QUERY_KEYS.skills */
  const { data, isLoading, isError, error } = useQuery<Skill[]>({
    queryKey: QUERY_KEYS.skills,
    queryFn: () => request<Skill[]>("/api/skills"),
  })

  return (
    <div>
      {/* 页头区域 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{t("skills.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("skills.subtitle")}</p>
      </div>

      {/* 列表容器 — 与背景区分，带圆角边框 */}
      <div className="rounded-lg border border-border bg-background">
        {/* 列头 */}
        <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-4 py-2">
          <span className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("skills.colName")}</span>
          <span className="shrink-0 text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("skills.colSource")}</span>
          <span className="shrink-0 hidden sm:block text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("skills.colUpdatedAt")}
          </span>
        </div>

        {/* 内容区域：根据请求状态渲染对应视图 */}
        {isLoading && <LoadingState />}
        {isError && <ErrorState message={(error as Error)?.message ?? t("common.loadFailed")} />}
        {!isLoading && !isError && data?.length === 0 && <EmptyState />}
        {!isLoading &&
          !isError &&
          data &&
          data.length > 0 &&
          // 遍历渲染每条 Skill 行
          data.map((skill) => <SkillRow key={skill.id} skill={skill} />)}
      </div>
    </div>
  )
}
