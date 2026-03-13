import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { request } from "@/lib/api"
import { QUERY_KEYS, TASK_STATUS_MAP } from "@/lib/constants"
import type { Task, TaskStatus } from "@/types"

/**
 * 看板列定义
 *
 * 每列包含标题、覆盖的状态列表，以及标题颜色 className。
 * 顺序决定列的渲染顺序。
 */
const COLUMNS: {
  /** 列标题对应的 i18n key */
  titleKey: string
  /** 该列包含的 TaskStatus 值 */
  statuses: TaskStatus[]
  /** 列标题的文字颜色 className */
  titleClass: string
}[] = [
  {
    titleKey: "tasks.columnQueued",
    statuses: ["pending", "assigned"],
    titleClass: "text-foreground",
  },
  {
    titleKey: "tasks.columnInProgress",
    statuses: ["running"],
    titleClass: "text-green-600",
  },
  {
    titleKey: "tasks.columnDone",
    statuses: ["completed", "failed", "cancelled"],
    titleClass: "text-muted-foreground",
  },
]

/**
 * 将 ISO 时间字符串格式化为本地日期时间短格式
 *
 * @param iso - ISO 8601 时间字符串
 * @returns 格式化后的本地时间，如 "Mar 13, 09:41"
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * TaskCard 组件 Props
 */
interface TaskCardProps {
  /** 要展示的任务数据 */
  task: Task
}

/**
 * TaskCard — 单张任务卡片
 *
 * 展示任务标题、状态标签、负责人（可选）和创建时间。
 * 使用纯 div 实现卡片样式，不依赖 shadcn Card 组件。
 *
 * @param props - {@link TaskCardProps}
 */
function TaskCard({ task }: TaskCardProps) {
  const { t } = useTranslation()
  /** 当前状态的显示配置（label + color） */
  const statusConfig = TASK_STATUS_MAP[task.status]

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      {/* 标题行：任务名 + 状态标签 */}
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1 text-sm font-medium text-foreground leading-snug">{task.title}</p>
        {/* 状态标签 */}
        <span className={`shrink-0 text-xs font-medium ${statusConfig.color}`}>
          {t(`tasks.status${task.status.charAt(0).toUpperCase()}${task.status.slice(1)}`)}
        </span>
      </div>

      {/* 负责人：仅当 assignedTo 有值时才渲染 */}
      {task.assignedTo && <p className="mt-1.5 text-xs text-muted-foreground truncate">{t("tasks.assignedTo", { agent: task.assignedTo })}</p>}

      {/* 创建时间 */}
      <p className="mt-1 text-xs text-muted-foreground">{formatDate(task.createdAt)}</p>
    </div>
  )
}

/**
 * KanbanColumn 组件 Props
 */
interface KanbanColumnProps {
  /** 列标题 */
  title: string
  /** 列标题颜色 className */
  titleClass: string
  /** 该列要展示的任务列表 */
  tasks: Task[]
}

/**
 * KanbanColumn — 看板单列
 *
 * 渲染一个状态列，包含列标题（带任务计数）和卡片堆叠列表。
 * 列内无任务时展示空状态提示。
 *
 * @param props - {@link KanbanColumnProps}
 */
function KanbanColumn({ title, titleClass, tasks }: KanbanColumnProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-3">
      {/* 列头：标题 + 任务数量 */}
      <div className="flex items-center gap-2">
        <h3 className={`text-sm font-semibold ${titleClass}`}>{title}</h3>
        {/* 任务数量徽标 */}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{tasks.length}</span>
      </div>

      {/* 卡片列表 */}
      {tasks.length === 0 ? (
        /* 空状态：该列无任务 */
        <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">{t("tasks.columnEmpty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Tasks 列表页面组件
 *
 * 职责：
 * 1. 通过 TanStack Query 拉取任务列表（/api/tasks）
 * 2. 根据 COLUMNS 定义将任务按状态过滤分组
 * 3. 渲染三列看板布局
 * 4. 处理加载中 / 错误 / 空数据三种场景
 */
export function Tasks() {
  const { t } = useTranslation()
  // 拉取任务列表，结果缓存在 QUERY_KEYS.tasks 下
  const {
    data: tasks,
    isLoading,
    isError,
    error,
  } = useQuery<Task[]>({
    queryKey: QUERY_KEYS.tasks,
    queryFn: () => request<Task[]>("/api/tasks"),
  })

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("tasks.title")}</h2>
        <p className="mt-2 text-muted-foreground">{t("tasks.subtitle")}</p>
        <p className="mt-8 text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  if (isError) {
    /** 错误消息，优先取 Error.message */
    const errorMessage = error instanceof Error ? error.message : t("common.unknownError")

    return (
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("tasks.title")}</h2>
        <p className="mt-2 text-muted-foreground">{t("tasks.subtitle")}</p>
        <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{t("common.loadFailed")}</p>
          <p className="mt-1 text-xs text-destructive/80">{errorMessage}</p>
        </div>
      </div>
    )
  }

  /** 任务列表，API 返回 null 时降级为空数组 */
  const taskList: Task[] = tasks ?? []

  if (taskList.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("tasks.title")}</h2>
        <p className="mt-2 text-muted-foreground">{t("tasks.subtitle")}</p>
        <div className="mt-8 rounded-lg border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">{t("tasks.empty")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("tasks.emptyHint")}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* 页面头部：标题 + 描述 */}
      <h2 className="text-2xl font-bold text-foreground">{t("tasks.title")}</h2>
      <p className="mt-2 text-muted-foreground">{t("tasks.subtitle")}</p>

      {/* 看板区域：三列等宽分栏，间距 gap-4 */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          /**
           * 按列定义的状态集合过滤任务
           * 用 Set 加速 includes 查找，避免数组遍历
           */
          const statusSet = new Set<TaskStatus>(col.statuses)
          const colTasks = taskList.filter((task) => statusSet.has(task.status))

          return <KanbanColumn key={col.titleKey} title={t(col.titleKey)} titleClass={col.titleClass} tasks={colTasks} />
        })}
      </div>
    </div>
  )
}
