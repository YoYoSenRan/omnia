import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useTasks } from "@/hooks/use-tasks"
import { TASK_STATUS_COLOR_MAP, TASK_STATUS_MAP } from "@/lib/constants"
import type { TaskStatus } from "@/types"

export function TaskDistribution() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: tasks, isLoading } = useTasks()

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">{t("dashboard.taskDistribution")}</h3>
        <div className="h-20 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  // 按状态分组计数
  const groups = (tasks ?? []).reduce<Record<string, number>>((acc, task) => {
    acc[task.status] = (acc[task.status] ?? 0) + 1
    return acc
  }, {})

  const total = tasks?.length ?? 0
  const entries = Object.entries(groups).filter(([, count]) => count > 0)

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-foreground">{t("dashboard.taskDistribution")}</h3>

      {!entries.length ? (
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground">{t("dashboard.noTasks")}</p>
          <button
            type="button"
            className="mt-2 text-xs text-muted-foreground underline transition-colors hover:text-foreground"
            onClick={() => navigate("/tasks")}
          >
            {t("dashboard.createTask")}
          </button>
        </div>
      ) : (
        <>
          {/* 进度条 */}
          <div className="mb-3 flex h-2 overflow-hidden rounded-full bg-muted">
            {entries.map(([status, count]) => (
              <div
                key={status}
                className={`${TASK_STATUS_COLOR_MAP[status] ?? "bg-gray-400"} transition-all`}
                style={{ width: `${(count / total) * 100}%` }}
              />
            ))}
          </div>

          {/* 图例 */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {entries.map(([status, count]) => (
              <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`size-2 rounded-full ${TASK_STATUS_COLOR_MAP[status] ?? "bg-gray-400"}`} />
                <span>{TASK_STATUS_MAP[status as TaskStatus]?.label ?? status}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
