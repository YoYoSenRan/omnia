import { useTranslation } from "react-i18next"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/zh-cn"
import { useActivities } from "@/hooks/use-activities"

dayjs.extend(relativeTime)

function parseDetail(detail: string | null): string {
  if (!detail) return ""
  try {
    const obj = JSON.parse(detail)
    if (obj.description) return obj.description
    if (obj.message) return obj.message
    return detail
  } catch {
    return detail
  }
}

export function ActivityFeed() {
  const { t, i18n } = useTranslation()
  const { data: activities, isLoading } = useActivities()

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium text-foreground">{t("dashboard.recentActivity")}</h3>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium text-foreground">{t("dashboard.recentActivity")}</h3>

      {!activities?.length ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("dashboard.noActivity")}</p>
      ) : (
        <div className="relative ml-2 border-l-2 border-border pl-4">
          {activities.map((log) => (
            <div key={log.id} className="relative pb-4 last:pb-0">
              {/* 时间线圆点 */}
              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-border bg-card" />
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{log.action}</span>
                    <span className="mx-1 text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{log.entityType}/{log.entityId}</span>
                  </p>
                  {log.detail && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {parseDetail(log.detail)}
                    </p>
                  )}
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {dayjs(log.createdAt).locale(i18n.language === "zh" ? "zh-cn" : "en").fromNow()}
                </time>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
