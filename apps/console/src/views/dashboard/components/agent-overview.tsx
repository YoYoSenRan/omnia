import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useAgents } from "@/hooks/use-agents"

const MAX_VISIBLE = 8

export function AgentOverview() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: agents, isLoading } = useAgents()

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">{t("dashboard.agentOverview")}</h3>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  const visible = agents?.slice(0, MAX_VISIBLE) ?? []
  const hasMore = (agents?.length ?? 0) > MAX_VISIBLE

  const statusDotColor: Record<string, string> = {
    idle: "bg-gray-400",
    running: "bg-green-500",
    error: "bg-red-500",
    offline: "bg-yellow-500",
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-foreground">{t("dashboard.agentOverview")}</h3>

      {!visible.length ? (
        <p className="py-4 text-center text-sm text-muted-foreground">{t("agents.empty")}</p>
      ) : (
        <div className="space-y-1">
          {visible.map((agent) => (
            <button
              key={agent.id}
              type="button"
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted"
              onClick={() => navigate(`/agents/${agent.id}`)}
            >
              <span className="flex items-center gap-2 text-sm text-foreground">
                <span>{agent.emoji ?? "🤖"}</span>
                <span>{agent.name}</span>
              </span>
              <span className={`size-2 rounded-full ${statusDotColor[agent.status] ?? "bg-gray-400"}`} />
            </button>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          className="mt-2 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => navigate("/agents")}
        >
          {t("dashboard.viewAllAgents")} →
        </button>
      )}
    </div>
  )
}
